"""Единая тёмная «студия» для фото услуг PRIME IT.
Каждый предмет вырезается и ставится на одинаковую сцену: мягкий верхний свет,
пол, контактная тень, лёгкое отражение, виньетка, зерно.
usage: python3 -I scripts/photo-studio.py config.json outdir [ids...]
Подробности и формат config.json — docs/photos.md.
"""
import sys, json, os
import numpy as np
import cv2

W, H = 1600, 1000
FLOOR = 0.79


def load(path):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        sys.exit('cannot read ' + path)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    return img


def fill_holes(mask):
    h, w = mask.shape
    flood = mask.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff, (0, 0), 255)
    return mask | cv2.bitwise_not(flood)


def keep_big(mask, frac=0.06):
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    if n <= 1:
        return mask
    big = stats[1:, cv2.CC_STAT_AREA].max()
    keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= big * frac]
    return np.isin(labels, keep).astype(np.uint8) * 255


def matte_plain(img, rect=None, hi=38, lo=10, holes=True):
    """Предмет на однотонном (белом/сером/цветном) фоне: GrabCut по цветовому расстоянию
    до фона + мягкий край и очистка ореола (decontamination)."""
    h, w = img.shape[:2]
    f = img.astype(np.float32)
    b = max(4, int(min(h, w) * 0.015))
    border = np.concatenate([f[:b].reshape(-1, 3), f[-b:].reshape(-1, 3), f[:, :b].reshape(-1, 3), f[:, -b:].reshape(-1, 3)])
    bg = np.median(border, 0)
    # локальный фон (учитывает неравномерный свет на подложке)
    small = cv2.resize(img, (64, 64), interpolation=cv2.INTER_AREA).astype(np.float32)
    d0 = np.linalg.norm(small - bg, axis=2)
    m = (d0 < 18).astype(np.float32)[..., None]
    if m.sum() > 50:
        acc = cv2.GaussianBlur(small * m, (0, 0), 6)
        wgt = cv2.GaussianBlur(m, (0, 0), 6)[..., None] if m.ndim == 2 else cv2.GaussianBlur(m[..., 0], (0, 0), 6)[..., None]
        bgmap = acc / np.maximum(wgt, 1e-3)
        bgmap = np.where(wgt > 0.02, bgmap, bg)
        bgmap = cv2.resize(bgmap, (w, h), interpolation=cv2.INTER_CUBIC)
    else:
        bgmap = np.broadcast_to(bg, f.shape).copy()
    d = np.linalg.norm(f - bgmap, axis=2)
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    mask[d > hi] = cv2.GC_PR_FGD
    mask[d < lo] = cv2.GC_PR_BGD
    mask[:b], mask[-b:], mask[:, :b], mask[:, -b:] = cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD
    if rect:
        x0, y0, x1, y1 = [int(v * s) for v, s in zip(rect, (w, h, w, h))]
        out = np.ones((h, w), bool); out[y0:y1, x0:x1] = False
        mask[out] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(img, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    hard = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    hard = keep_big(cv2.morphologyEx(hard, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))
    if holes:
        hard = fill_holes(hard)
    # мягкий край: в узкой полосе альфа = расстояние до цвета фона
    band = cv2.dilate(hard, np.ones((5, 5), np.uint8)) & ~cv2.erode(hard, np.ones((5, 5), np.uint8))
    soft = np.clip((d - lo) / (hi - lo), 0, 1)
    a = hard.astype(np.float32) / 255
    a = np.where(band > 0, np.minimum(soft, cv2.dilate(a, np.ones((3, 3), np.uint8))), a)
    a = cv2.GaussianBlur(a, (0, 0), 0.6)
    # убираем подмешанный цвет фона из полупрозрачного края
    aa = np.clip(a, 0.05, 1)[..., None]
    fg = np.clip((f - (1 - aa) * bgmap) / aa, 0, 255)
    f = np.where((a[..., None] < 0.98), fg, f)
    return f, a


def matte_alpha(img):
    f = img[..., :3].astype(np.float32)
    a = img[..., 3].astype(np.float32) / 255
    hard = keep_big((a > 0.5).astype(np.uint8) * 255, 0.02)
    a = a * (cv2.dilate(hard, np.ones((7, 7), np.uint8)) > 0)
    return f, a


def wallpaper(kind, w=1600, h=1000):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx, ny = x / w, y / h
    if kind == 'blue':     # нейтральная «системная» заставка без логотипов
        c1 = np.array([92, 38, 10], np.float32)   # BGR тёмно-синий
        c2 = np.array([255, 150, 40], np.float32)
        g = np.exp(-(((nx - 0.62) / 0.42) ** 2 + ((ny - 0.62) / 0.36) ** 2))
        g2 = np.exp(-(((nx - 0.3) / 0.3) ** 2 + ((ny - 0.25) / 0.3) ** 2)) * 0.35
        img = c1 * (1 - g[..., None]) + c2 * g[..., None] + np.array([255, 120, 120], np.float32) * g2[..., None]
    else:                  # фирменная: тёмная с жёлто-зелёным свечением (#eeff00)
        c1 = np.array([14, 12, 10], np.float32)
        acc = np.array([0, 255, 238], np.float32)
        g = np.exp(-(((nx - 0.78) / 0.42) ** 2 + ((ny - 0.92) / 0.38) ** 2)) * 0.32
        g2 = np.exp(-(((nx - 0.15) / 0.25) ** 2 + ((ny - 0.1) / 0.3) ** 2)) * 0.12
        img = c1 + acc * g[..., None] + np.array([255, 255, 255], np.float32) * g2[..., None]
    return np.clip(img, 0, 255)


def texture(spec):
    img = load(spec['src'])[..., :3].astype(np.float32)
    h, w = img.shape[:2]
    q = np.float32(spec['quad']) * np.float32([w, h])
    M = cv2.getPerspectiveTransform(q, np.float32([[0, 0], [1600, 0], [1600, 1000], [0, 1000]]))
    return cv2.warpPerspective(img, M, (1600, 1000), flags=cv2.INTER_CUBIC)


def put_screen(f, a, quad, kind):
    h, w = f.shape[:2]
    quad = np.float32(quad) * np.float32([w, h])
    c = quad.mean(0); quad = c + (quad - c) * 1.006
    wp = texture(kind) if isinstance(kind, dict) else wallpaper(kind)
    src = np.float32([[0, 0], [1600, 0], [1600, 1000], [0, 1000]])
    M = cv2.getPerspectiveTransform(src, quad)
    warped = cv2.warpPerspective(wp, M, (w, h), flags=cv2.INTER_LINEAR)
    m = np.zeros((h, w), np.float32)
    cv2.fillConvexPoly(m, quad.astype(np.int32), 1.0, lineType=cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 0.8)[..., None]
    # стекло: лёгкий блик сверху-слева
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    glare = np.clip(1 - ((x - quad[0, 0]) / w + (y - quad[0, 1]) / h) * 2.2, 0, 1)[..., None] * 18
    f = f * (1 - m) + (warped + glare) * m
    a = np.maximum(a, m[..., 0])
    return f, a


def lay_flat(f, a, tilt=0.55, taper=0.86):
    """Плоский предмет «кладём» на стол: перспектива как при съёмке сверху под углом."""
    h, w = a.shape
    nh = int(h * tilt)
    inset = w * (1 - taper) / 2
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[inset, 0], [w - inset, 0], [w, nh], [0, nh]])
    M = cv2.getPerspectiveTransform(src, dst)
    f2 = cv2.warpPerspective(f, M, (w, nh), flags=cv2.INTER_AREA)
    a2 = cv2.warpPerspective(a, M, (w, nh), flags=cv2.INTER_AREA)
    # толщина: тёмная грань снизу
    edge = int(max(4, nh * 0.025))
    out_f = np.zeros((nh + edge, w, 3), np.float32); out_a = np.zeros((nh + edge, w), np.float32)
    for k in range(edge, 0, -1):
        out_f[k:k + nh] = out_f[k:k + nh] * (1 - a2[..., None]) + f2 * 0.3 * a2[..., None]
        out_a[k:k + nh] = np.maximum(out_a[k:k + nh], a2)
    out_f[:nh] = out_f[:nh] * (1 - a2[..., None]) + f2 * a2[..., None]
    out_a[:nh] = np.maximum(out_a[:nh], a2)
    return out_f, out_a


def background():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    spot = np.exp(-(((x - W / 2) / (W * 0.45)) ** 2 + ((y - H * 0.22) / (H * 0.6)) ** 2))
    wall = 9 + 30 * spot
    fy = H * FLOOR
    # пол: светлее у линии горизонта под предметом, к зрителю темнеет
    fspot = np.exp(-(((x - W / 2) / (W * 0.38)) ** 2 + ((y - fy) / (H * 0.16)) ** 2))
    floor = 7 + 22 * fspot
    t = np.clip((y - fy + 10) / 20, 0, 1)
    base = wall * (1 - t) + floor * t
    bg = np.stack([base * 0.98, base, base * 1.02], -1)   # BGR, чуть тёплый
    return bg


def grade(obj, a, gain, gamma=1.0):
    lum = (obj.mean(2) * a).sum() / max(a.sum(), 1)
    k = (118 / max(lum, 1)) ** 0.4 * gain
    o = np.clip(obj * k, 0, 255) / 255
    o = o ** gamma
    # лёгкий контраст + сатурация как в коммерческой съёмке
    m = o.mean(2, keepdims=True)
    o = m + (o - m) * 1.08
    o = (o - 0.5) * 1.06 + 0.5
    return np.clip(o * 255, 0, 255)


def rim_light(obj, a):
    """Тонкий контровой свет по верхнему краю — отделяет тёмный предмет от тёмного фона."""
    e = cv2.erode(a, np.ones((5, 5), np.uint8))
    rim = np.clip(a - e, 0, 1)
    up = np.clip(np.roll(a, 6, 0) - a, 0, 1)  # пиксели, над которыми пусто
    k = cv2.GaussianBlur(np.maximum(rim * 0.5, (a - np.roll(a, -4, 0)).clip(0, 1)), (0, 0), 1.2)
    return np.clip(obj + k[..., None] * 38, 0, 255)


def compose(f, a, cfg):
    ys, xs = np.where(a > 0.35)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    obj, al = f[y0:y1 + 1, x0:x1 + 1], a[y0:y1 + 1, x0:x1 + 1]
    if cfg.get('flip'):
        obj, al = obj[:, ::-1], al[:, ::-1]
    if cfg.get('flat'):
        obj, al = lay_flat(obj, al, cfg.get('tilt', 0.55), cfg.get('taper', 0.86))
    oh, ow = al.shape
    k = min(W * cfg.get('w', 0.66) / ow, H * cfg.get('h', 0.6) / oh)
    nw, nh = int(ow * k), int(oh * k)
    interp = cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC
    obj = cv2.resize(obj, (nw, nh), interpolation=interp)
    al = np.clip(cv2.resize(al, (nw, nh), interpolation=interp), 0, 1)
    if k > 1.05:   # мягкая резкость после увеличения
        bl = cv2.GaussianBlur(obj, (0, 0), 1.4)
        obj = np.clip(obj + (obj - bl) * 0.5, 0, 255)
    obj = grade(obj, al, cfg.get('gain', 1.0), cfg.get('gamma', 1.0))
    obj = rim_light(obj, al)
    canvas = background()
    base_y = int(H * FLOOR) + int(cfg.get('sink', 0) * nh)
    px = (W - nw) // 2 + int(cfg.get('dx', 0) * W)
    py = base_y - nh
    # тень по нижнему контуру предмета: под каждой колонкой — у её нижней точки
    full = np.zeros((H, W), np.float32)
    x_a, x_b = max(0, px), min(W, px + nw)
    full[max(0, py):py + nh, x_a:x_b] = al[max(0, -py):, x_a - px:x_b - px]
    has = full > 0.3
    bottom = np.where(has.any(0), H - 1 - np.argmax(has[::-1], 0), -1)
    yy = np.arange(H, dtype=np.float32)[:, None]
    depth = max(6.0, nh * 0.05)
    near = np.where(bottom[None] >= 0, np.exp(-np.clip(bottom[None] - yy, 0, None) / depth), 0) * (yy <= bottom[None] + 2)
    sh = (full * near).astype(np.float32)
    sh = np.roll(sh, int(max(3, nh * 0.012)), 0)
    contact = cv2.GaussianBlur(sh, (0, 0), 5)
    wide = cv2.GaussianBlur(np.roll(sh, int(nh * 0.02), 0), (0, 0), 30)
    canvas *= (1 - np.clip(0.9 * contact + 0.75 * wide, 0, 0.93))[..., None]
    # отражение
    rh = min(nh, H - base_y)
    if rh > 4:
        refl, ra = obj[::-1][:rh], al[::-1][:rh]
        fade = (np.linspace(1, 0, rh, dtype=np.float32) ** 2.2 * cfg.get('refl', 0.13))[:, None]
        x_a, x_b = max(0, px), min(W, px + nw)
        reg = canvas[base_y:base_y + rh, x_a:x_b]
        rr, raa = refl[:, x_a - px:x_b - px], (ra * fade)[:, x_a - px:x_b - px, None]
        canvas[base_y:base_y + rh, x_a:x_b] = reg * (1 - raa) + rr * raa
    # предмет
    y_a = max(0, py)
    reg = canvas[y_a:py + nh, px:px + nw]
    o, aa = obj[y_a - py:], al[y_a - py:, :, None]
    canvas[y_a:py + nh, px:px + nw] = reg * (1 - aa) + o * aa
    # виньетка и зерно
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    vig = 1 - 0.38 * (((x - W / 2) / (W / 2)) ** 2 * 0.8 + ((y - H * 0.55) / (H / 2)) ** 2)
    canvas *= np.clip(vig, 0.5, 1)[..., None]
    canvas += np.random.default_rng(7).normal(0, 1.8, canvas.shape)
    return np.clip(canvas, 0, 255).astype(np.uint8)


def render(cfg):
    img = load(cfg['src'])
    if cfg.get('crop'):
        h, w = img.shape[:2]; x0, y0, x1, y1 = cfg['crop']
        img = img[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
    if max(img.shape[:2]) > 1800:
        k = 1800 / max(img.shape[:2]); img = cv2.resize(img, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    if cfg['mode'] == 'alpha':
        f, a = matte_alpha(img)
    else:
        f, a = matte_plain(img[..., :3], cfg.get('rect'), cfg.get('hi', 38), cfg.get('lo', 10), cfg.get('holes', True))
    if cfg.get('screen'):
        f, a = put_screen(f, a, cfg['screen'], cfg.get('wall', 'brand'))
    return compose(f, a, cfg), a


if __name__ == '__main__':
    conf = json.load(open(sys.argv[1]))
    outdir = sys.argv[2]
    ids = sys.argv[3:] or list(conf)
    os.makedirs(outdir, exist_ok=True)
    for i in ids:
        out, a = render(conf[i])
        cv2.imwrite(os.path.join(outdir, i + '.png'), out)
        cv2.imwrite(os.path.join(outdir, i + '-mask.png'), (a * 255).astype(np.uint8))
        print('OK', i)

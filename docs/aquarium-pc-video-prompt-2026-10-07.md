# PRIME IT: сборка ПК-аквариума и приближение к дисплею СЖО

7 октября 2026.

## Обновление сайта

По запросу владельца старое видео и кнопка «Видео» удалены. Удалены компонент HeroVideo, его импорт и стили, исходный и сжатый MP4, а также копирование видео в public при сборке. Build-скрипт удаляет старый public/media/hero.mp4 и при повторном локальном запуске.

Существующая SVG-сборка сохраняется до подготовки нового материала. Новый ролик этим изменением не создан и не установлен.

## Бриф

Современный корпус-аквариум с панорамными передним и боковым стеклом, СЖО 360 мм и дисплеем на помпе процессора. Компьютер собирается в одном последовательном кадре. После сборки запускаются все девять RGB-вентиляторов. Последняя часть — плавное приближение к дисплею СЖО, где читается PRIME IT.

Никаких вымышленных характеристик или цен конфигурации. Это демонстрационный визуал, не фотография реальной работы сервисного центра.

## Основной промпт

```text
Create a 10-second photorealistic cinematic assembly film of a premium gaming PC for the PRIME IT computer repair website. Landscape 16:9, 24 fps, one continuous shot.

Use a modern matte-black dual-chamber aquarium-style case with pillarless 270-degree panoramic front and left tempered-glass panels. The front is a clear glass window. The PC contains an ATX motherboard, a CPU, two RGB RAM modules, an M.2 SSD, a large triple-fan graphics card, a concealed power supply, tidy braided cables, and a 360 mm all-in-one liquid cooler with a circular LCD on the CPU pump.

Exactly nine RGB case fans: three bottom intake fans, three side intake fans, and three fans on the top-mounted AIO radiator. Keep the same case, components, dimensions, materials, fan count and mounting positions throughout the entire film.

Place the tower on a dark studio surface in the right 60% of the frame, leaving clean nearly-black negative space on the left for website text. Use a three-quarter camera angle that clearly shows both panoramic glass panels and the CPU cooler LCD. Keep the camera locked during assembly. Every component moves as a rigid solid object along a short, mechanically correct installation path; installed parts remain fixed.

0.0–1.0 seconds: The empty aquarium chassis stands firmly on the surface. Establish crisp metal edges, realistic thickness and mounting points.

1.0–3.0 seconds: The motherboard with the CPU installs against its standoffs. The two RAM modules seat in their slots, then the M.2 SSD installs.

3.0–5.0 seconds: The graphics card seats in its PCIe slot. The power supply installs in the concealed rear chamber. Braided cables route neatly and connect to the motherboard and GPU.

5.0–7.0 seconds: The bottom and side fan assemblies install. The complete connected liquid-cooling assembly installs: top radiator with three fans and LCD-equipped CPU pump. Keep both coolant tubes continuously connected, with believable flexible curves and consistent thickness. The panoramic glass panels close into their mounting points. The LCD stays off during assembly.

7.0–8.0 seconds: The completed PC powers on. All nine RGB case fans visibly rotate around stable hubs on their correct axes, with natural subtle motion blur. The blades rotate while the LED rings remain fixed to their frames. The LCD powers on. Their LED rings and the RAM light up in a coordinated rainbow gradient: red, amber, green, cyan, blue, violet and magenta. Show restrained bloom and realistic coloured reflections on the glass, hardware and surface.

8.0–9.5 seconds: Begin a slow, smooth physical dolly-in toward the CPU cooler LCD with gentle reframing. Move closer through the view of the transparent side panel while keeping the camera OUTSIDE the closed case at all times. Never intersect the glass or hardware. Keep the LCD in the right half of the image and the left side visually quiet. Shift focus smoothly from the complete PC onto the LCD.

9.5–10.0 seconds: Hold a sharp close-up of the circular AIO display. On its black screen, show ONLY the exact centred text "PRIME IT", in bold uppercase white sans-serif letters, spelled P R I M E, one space, I T. The text is part of the physical LCD, with correct perspective and subtle screen reflections; it is not a floating overlay. RGB fans continue rotating softly out of focus in the background. Keep the final frame stable and premium.

Use physically based materials, believable hardware proportions, realistic glass and reflections, soft directional studio lighting, deep slate-black surroundings and detailed product cinematography. Preserve smooth component motion from frame to frame. Silent visual output. Clean hardware without external brand logos or specifications.
```

Если платформа предоставляет отдельное поле negative prompt:

```text
Scene cuts, camera shake, orbiting camera during assembly, morphing hardware, dissolving parts, changing case design, duplicated components, changing fan count, opaque front panel, impossible collisions, disconnected coolant tubes, intersecting glass, floating cables, exaggerated neon bloom, misspelled PRIME IT, extra text, labels, captions, watermarks, HUD overlays, people, hands.
```

Если выбранная платформа поддерживает только 8 секунд, умножить все временные отметки на 0,8; оставить последний отрезок для приближения и удержания дисплея. Промпт задаёт художественный бриф, а не гарантирует точный тайминг генерации.

Для мобильной композиции заменить формат на 9:16, поставить корпус по центру, оставить безопасные отступы сверху и снизу; в финале дисплей находится в верхней или средней части кадра, над нижней панелью связи.

## Как получить точную надпись PRIME IT

Прямое указание текста в промпте помогает задать цель, но не гарантирует правильные буквы в каждом кадре AI-видео. Для финального материала предпочтительны два варианта:

1. В Blender использовать подготовленную текстуру дисплея с PRIME IT. Надпись является частью материала экрана и сохраняет перспективу при движении камеры.
2. При видеогенерации получить равномерно чёрный LCD с отчётливой границей, затем добавить заранее подготовленную надпись с отслеживанием перспективы экрана и маской отражений стекла.

Для второго варианта заменить описание надписи в основном промпте на:

```text
The circular LCD remains uniformly black throughout the film, with a stable, clearly visible screen boundary for later compositing. Preserve the physical screen perspective, its subtle reflections and the uninterrupted camera movement.
```

Для image-to-video нужны согласованные референсы именно нового корпуса-аквариума: пустой корпус и полностью собранный ПК с теми же компонентами. Предыдущий референс обычного корпуса с передними вентиляторами не задаёт новую панорамную конструкцию.

Сначала проверить геометрию, отсутствие пересечений, устойчивое число вентиляторов и расположение СЖО, затем надпись. Тайминг генеративного видео может быть приблизительным. Камера в финале остаётся снаружи закрытого стекла.

## Вращение после завершения прокрутки

В основном ролике вентиляторы вращаются в последних кадрах. Последовательность кадров останавливается вместе с прокруткой. Если требуется постоянное вращение в финале при неподвижной странице, отдельно подготовить короткую петлю конечного плана с той же камерой, надписью, светом и геометрией. Это ещё не подключённая функция.

Промпт для такой отдельной петли:

```text
Use the supplied final LCD close-up as the exact composition. Create a short seamless loop with a completely stationary camera. Keep the circular screen, the exact PRIME IT lettering, exposure, reflections and all hardware fixed. Only the visible RGB fans rotate smoothly in the softly blurred background; the RGB colour pattern remains stable. The beginning and ending match seamlessly. Silent output.
```

## Проверка удаления старого видео

[Production QA](https://github.com/winproga-dot/prime-it/actions/runs/37599324057) успешно завершён на коммите `a0b0b6481fc7f9317e273272dbe332fda8f69452`.

- `npm install`, `npm run build`, статический HTML/metadata/FAQ всех 11 страниц: успешно. `npm audit`: 0 уязвимостей.
- Проверены отсутствие старого video/control в HTML и браузере, отсутствие запросов к прежнему MP4 и отсутствие файла в production output.
- 14 сценариев прокрутки, 8 проверок компактного процесса/записи и 172 общих браузерных сценария: успешно.
- Chromium и WebKit: 360×800, 390×844, 412×915, 430×932, 1366×768, 1920×1080 и 2560×1440. Проверены reduced motion, 200% текста, deep links и работа без JavaScript. axe: 0 нарушений в проверенных сценариях.
- Lighthouse главной: 99 / 100 / 100 / 100; LCP 2,1 с, CLS 0,004, TBT 0 мс.
- Lighthouse страницы чистки: 100 / 100 / 100 / 100; LCP 1,7 с, CLS 0, TBT 0 мс.
- JS gzip 77,52 КБ; CSS gzip 12,30 КБ. Из дерева удалены старые видеоматериалы суммарно 3 159 851 байт.

[Артефакт проверки](https://github.com/winproga-dot/prime-it/actions/runs/37599324057/artifacts/11472253744) содержит production build, отчёты и screenshots. Проверка относится к коду сайта; новый ролик ещё не создан.

Изменения сохранены в [PR #1](https://github.com/winproga-dot/prime-it/pull/1). При проверке коммита a0b0b648 GitHub ещё не получил статус нового развёртывания Vercel. Удаление старого видео подтверждено в production build; актуальный статус предпросмотра проверяется отдельно.

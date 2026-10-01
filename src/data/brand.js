export const brand = Object.freeze({
  name: 'PRIME IT',
  city: 'Алматы',
  street: 'ул. Сатпаева, 105А',
  address: 'Алматы, ул. Сатпаева, 105А',
  phoneDisplay: '8 (707) 684-06-25',
  phoneTel: '+77076840625',
  whatsapp: '77076840625',
  email: 'prime.it.08@gmail.com',
  hours: 'Без выходных, 10:00–20:00',
  url: 'https://www.prime-it.kz/',
  warranty: 'До 3 месяцев на выполненные работы. На запчасти — гарантия поставщика.',
  // Set only after verifying the current business card, address and phone.
  twoGisUrl: null,
  twoGisSearch: 'https://2gis.kz/almaty/search/' + encodeURIComponent('PRIME IT Сатпаева 105А'),
  twoGisAddress: 'https://2gis.kz/almaty/search/' + encodeURIComponent('Алматы Сатпаева 105А'),
  routeUrl: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Алматы, ул. Сатпаева, 105А'),
});

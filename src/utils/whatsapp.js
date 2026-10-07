import { brand } from '../data/brand.js';
export const greeting = 'Здравствуйте! Пишу с сайта PRIME IT.';
export const messages = {
  hero: greeting + ' Хочу записаться на бесплатную диагностику. Подскажите, как согласовать визит или выезд.',
  question: greeting + ' Хочу уточнить условия ремонта и бесплатной диагностики.',
  contact: greeting + ' Хочу уточнить стоимость и согласовать время приёма или условия выезда.',
  service: title => greeting + ' Интересует ремонт/услуга: ' + title + '. Подскажите, пожалуйста, стоимость и как согласовать визит или выезд?\n\nМодель устройства:\nКомментарий:',
  symptom: title => greeting + ' Проблема: ' + (title || 'нужна помощь с компьютером или ноутбуком') + '. Хочу пройти бесплатную диагностику и узнать стоимость ремонта.\n\nМодель устройства:\nКомментарий:',
  license: name => greeting + ' Интересует лицензия: ' + name + '. Подскажите условия покупки и установки.',
};
export function whatsappUrl(message = messages.hero) {
  return 'https://wa.me/' + brand.whatsapp + '?text=' + encodeURIComponent(message);
}

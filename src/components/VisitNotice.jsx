import { brand } from '../data/brand.js';
import Icon from './Icon.jsx';
export default function VisitNotice({ className = '', detailed = false }) {
  return <p className={'visit-notice ' + className}><Icon name="Phone" size={16} />
    <span><strong>{brand.visitNotice}</strong><span className="visit-detail">{detailed ? brand.visitDetails : 'Мастер может быть на выезде.'}</span></span>
  </p>;
}

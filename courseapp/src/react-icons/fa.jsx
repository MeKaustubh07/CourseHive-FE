import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

// Accept a className prop and merge it with the default class
export const PhoneIcon = ({ className }) => {
  return <FontAwesomeIcon icon={faPhone} className={`phone-icon ${className || ''}`} />;
};


// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPhone } from '@fortawesome/free-solid-svg-icons';

// export const PhoneIcon = () => {
//   return <FontAwesomeIcon icon={faPhone} className="phone-icon"/>;
// };
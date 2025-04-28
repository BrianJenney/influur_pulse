import Logo from '@/public/influur_logos/influur_pulse.svg';
import Image from 'next/image';

export const InfluurLogo = () => {
	return <Image src={Logo} alt='Influur Logo' className='h-8 w-auto' />;
};

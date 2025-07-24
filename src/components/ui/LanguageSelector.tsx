import { useState } from 'react';
import { IoChevronForward, IoArrowBack } from 'react-icons/io5';

import strings from '../../global/constants/StringConstants';

interface LanguageSelectorProps {
    className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    return (
        <div className={`flex items-center gap-2 text-sm text-text-secondary cursor-pointer ${className}`}>
            <span>{strings.SELECT_LANGUAGE}</span>
            <IoChevronForward className="w-4 h-4" />
        </div>
    );
};


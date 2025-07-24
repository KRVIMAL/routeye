import React from 'react';
import strings from '../../global/constants/StringConstants';

export const AppDownloadSection: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {strings.DOWNLOAD_APP}
            </h3>
            <div className="flex gap-4">
                <a
                    href="#"
                    className="block"
                    onClick={(e) => e.preventDefault()}
                >
                    <img
                        src="/images/google-play-badge.png"
                        alt="Get it on Google Play"
                        className="h-12"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 h-12">
                        <div className="text-xs">
                            <div>GET IT ON</div>
                            <div className="font-semibold">Google Play</div>
                        </div>
                    </div>
                </a>
                <a
                    href="#"
                    className="block"
                    onClick={(e) => e.preventDefault()}
                >
                    <img
                        src="/images/app-store-badge.png"
                        alt="Download on the App Store"
                        className="h-12"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 h-12">
                        <div className="text-xs">
                            <div>Download on the</div>
                            <div className="font-semibold">App Store</div>
                        </div>
                    </div>
                </a>
            </div>
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <a href="#" className="hover:text-primary-500 transition-colors">
                    {strings.TERMS_CONDITIONS}
                </a>
                <a href="#" className="hover:text-primary-500 transition-colors">
                    {strings.PRIVACY_POLICY}
                </a>
            </div>
        </div>
    );
};
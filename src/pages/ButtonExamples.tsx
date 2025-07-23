// src/styles/button-custom.css (Add to your global CSS)
/* Custom hover effects for buttons with custom colors */


// ================================================================
// USAGE EXAMPLES - How to use your custom buttons
// ================================================================

import React from 'react';
import {
    Button,
    SubmitButton,
    SubmitLoadingButton,
    DeleteButton,
    EditButton,
    CheckIcon,
    EditIcon,
    DeleteIcon,
    ButtonProps
} from '../components/ui/Button';

// Example component showing all button variants
export const ButtonExamples: React.FC = () => {
    const [loading, setLoading] = React.useState(false);

    return (
        <div className="p-8 space-y-8">

            {/* 1. Your Exact Design Buttons */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Your Design System Buttons</h3>
                <div className="flex gap-4 flex-wrap">

                    {/* Submit Button with exact colors */}
                    <Button
                        variant="custom"
                        customColors={{
                            background: '#1F3A8A',
                            text: '#FFFFFF',
                            hover: { background: '#1D40B0' }
                        }}
                        icon={CheckIcon}
                        className="btn-custom-hover"
                    >
                        Submit
                    </Button>

                    {/* Submit Loading */}
                    <Button
                        variant="custom"
                        customColors={{
                            background: '#1F3A8A',
                            text: '#FFFFFF',
                            hover: { background: '#1D40B0' }
                        }}
                        loading={true}
                        className="btn-custom-hover"
                    >
                        Submit
                    </Button>

                    {/* Delete Button with exact colors */}
                    <Button
                        variant="custom"
                        customColors={{
                            background: '#F3F4F6',
                            text: '#374151',
                            border: '#E5E7EB',
                            hover: { background: '#F1F1F1' }
                        }}
                        icon={DeleteIcon}
                        className="btn-custom-hover"
                    >
                        Delete
                    </Button>

                    {/* Edit Button with exact colors */}
                    <Button
                        variant="custom"
                        customColors={{
                            background: '#1F3A8A',
                            text: '#FFFFFF',
                            hover: { background: '#1D40B0' }
                        }}
                        icon={EditIcon}
                        className="btn-custom-hover"
                    >
                        Edit
                    </Button>

                </div>
            </section>

            {/* 2. Size Variations */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Size Variations</h3>
                <div className="flex items-center gap-4 flex-wrap">
                    <SubmitButton size="xs" />
                    <SubmitButton size="sm" />
                    <SubmitButton size="md" />
                    <SubmitButton size="lg" />
                    <SubmitButton size="xl" />
                </div>
            </section>

            {/* 3. Custom Dimensions */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Custom Dimensions</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button width={200} height={50} variant="primary">
                        Custom Size
                    </Button>
                    <Button width="300px" height="60px" variant="secondary">
                        Large Custom
                    </Button>
                    <Button fullWidth variant="primary" className="max-w-md">
                        Full Width
                    </Button>
                </div>
            </section>

            {/* 4. Icon Positions */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Icon Positions</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="primary" icon={CheckIcon} iconPosition="left">
                        Icon Left
                    </Button>
                    <Button variant="primary" icon={CheckIcon} iconPosition="right">
                        Icon Right
                    </Button>
                    <Button variant="primary" icon={CheckIcon} iconPosition="only" />
                </div>
            </section>

            {/* 5. Loading States */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Loading States</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="primary" loading={loading} onClick={() => setLoading(!loading)}>
                        Toggle Loading
                    </Button>
                    <SubmitLoadingButton />
                    <Button variant="secondary" loading={true} icon={DeleteIcon}>
                        Deleting...
                    </Button>
                </div>
            </section>

            {/* 6. Rounded Variations */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Rounded Variations</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="primary" rounded="none">Square</Button>
                    <Button variant="primary" rounded="sm">Small</Button>
                    <Button variant="primary" rounded="md">Medium</Button>
                    <Button variant="primary" rounded="lg">Large</Button>
                    <Button variant="primary" rounded="full">Pill</Button>
                </div>
            </section>

            {/* 7. Shadow Variations */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Shadow Variations</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="primary" shadow="none">No Shadow</Button>
                    <Button variant="primary" shadow="sm">Small</Button>
                    <Button variant="primary" shadow="md">Medium</Button>
                    <Button variant="primary" shadow="lg">Large</Button>
                    <Button variant="primary" shadow="xl">Extra Large</Button>
                </div>
            </section>

            {/* 8. All Variants */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
                <div className="flex gap-4 flex-wrap">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                </div>
            </section>

            {/* 9. Real-world Examples */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Real-world Form Examples</h3>

                {/* Form Actions */}
                <div className="border border-border-default rounded-lg p-6 bg-surface">
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost">
                            Cancel
                        </Button>
                        <Button variant="secondary" icon={DeleteIcon}>
                            Delete Draft
                        </Button>
                        <Button variant="primary" icon={CheckIcon}>
                            Save & Continue
                        </Button>
                    </div>
                </div>

                {/* Table Actions */}
                <div className="mt-4 border border-border-default rounded-lg p-4 bg-surface">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Device Management</h4>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" icon={EditIcon}>
                                Edit
                            </Button>
                            <Button size="sm" variant="danger" icon={DeleteIcon}>
                                Delete
                            </Button>
                            <Button size="sm" variant="primary" icon={CheckIcon}>
                                Activate
                            </Button>
                        </div>
                    </div>
                </div>

            </section>

        </div>
    );
};

// ================================================================
// FORM INTEGRATION EXAMPLES
// ================================================================

// Example: Form with your custom buttons
export const FormExample: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-surface rounded-lg border border-border-default">
            <h2 className="text-xl font-semibold mb-4">Device Configuration</h2>

            {/* Form fields would go here */}
            <div className="space-y-4 mb-6">
                <input
                    type="text"
                    placeholder="Device Name"
                    className="w-full px-3 py-2 border border-border-default rounded-md bg-background text-text-primary"
                />
                <input
                    type="text"
                    placeholder="IMEI Number"
                    className="w-full px-3 py-2 border border-border-default rounded-md bg-background text-text-primary"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="custom"
                    customColors={{
                        background: '#1F3A8A',
                        text: '#FFFFFF',
                        hover: { background: '#1D40B0' }
                    }}
                    loading={isSubmitting}
                    fullWidth
                    className="btn-custom-hover"
                >
                    {isSubmitting ? 'Saving...' : 'Save Device'}
                </Button>
            </div>
        </form>
    );
};

// ================================================================
// REUSABLE BUTTON PRESETS FOR YOUR PROJECT
// ================================================================

// Primary action buttons (your exact design)
export const PrimaryActionButton: React.FC<ButtonProps> = ({ children, ...props }) => (
    <Button
        variant="custom"
        customColors={{
            background: '#1F3A8A',
            text: '#FFFFFF',
            hover: { background: '#1D40B0' }
        }}
        className="btn-custom-hover"
        {...props}
    >
        {children}
    </Button>
);

// Secondary action buttons (your exact design)
export const SecondaryActionButton: React.FC<ButtonProps> = ({ children, ...props }) => (
    <Button
        variant="custom"
        customColors={{
            background: '#F3F4F6',
            text: '#374151',
            border: '#E5E7EB',
            hover: { background: '#F1F1F1' }
        }}
        className="btn-custom-hover border"
        {...props}
    >
        {children}
    </Button>
);

export default ButtonExamples;
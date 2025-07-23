import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { FiSave, FiDownload } from 'react-icons/fi';

const StyleGuide: React.FC = () => {
  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-display text-text-primary mb-md">Style Guide</h1>
        <p className="text-body text-text-secondary">
          A comprehensive overview of our design system components and styles.
        </p>
      </div>

      {/* Typography */}
      <Card>
        <Card.Header>
          <h2 className="text-heading-2 text-text-primary">Typography</h2>
        </Card.Header>
        <Card.Body>
          <div className="space-y-md">
            <div>
              <h1 className="text-display text-text-primary">Display Text</h1>
              <h2 className="text-heading-1 text-text-primary">Heading 1</h2>
              <h3 className="text-heading-2 text-text-primary">Heading 2</h3>
              <h4 className="text-heading-3 text-text-primary">Heading 3</h4>
              <p className="text-body-large text-text-primary">Body Large</p>
              <p className="text-body text-text-secondary">Body Text</p>
              <p className="text-body-small text-text-tertiary">Body Small</p>
              <p className="text-caption text-text-muted">Caption Text</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Buttons */}
      <Card>
        <Card.Header>
          <h2 className="text-heading-2 text-text-primary">Buttons</h2>
        </Card.Header>
        <Card.Body>
          <div className="space-y-md">
            <div className="flex flex-wrap gap-md">
              <Button variant="primary" icon={FiSave}>Primary</Button>
              <Button variant="secondary" icon={FiDownload}>Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
            </div>
            <div className="flex flex-wrap gap-md">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-md">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Form Elements */}
      <Card>
        <Card.Header>
          <h2 className="text-heading-2 text-text-primary">Form Elements</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Input label="Username" placeholder="Enter username" />
            <Input label="Email" type="email" placeholder="Enter email" />
            <Input label="Password" type="password" error="Password is required" />
            <Input label="Search" placeholder="Search..." helper="Type to search" />
          </div>
        </Card.Body>
      </Card>

      {/* Badges */}
      <Card>
        <Card.Header>
          <h2 className="text-heading-2 text-text-primary">Badges</h2>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-md">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Color Palette */}
      <Card>
        <Card.Header>
          <h2 className="text-heading-2 text-text-primary">Color Palette</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="space-y-2">
              <h4 className="text-body-small font-semibold text-text-primary">Primary</h4>
              <div className="space-y-1">
                <div className="w-full h-8 bg-primary-500 rounded"></div>
                <div className="w-full h-6 bg-primary-600 rounded"></div>
                <div className="w-full h-6 bg-primary-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-body-small font-semibold text-text-primary">Success</h4>
              <div className="space-y-1">
                <div className="w-full h-8 bg-success-500 rounded"></div>
                <div className="w-full h-6 bg-success-600 rounded"></div>
                <div className="w-full h-6 bg-success-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-body-small font-semibold text-text-primary">Warning</h4>
              <div className="space-y-1">
                <div className="w-full h-8 bg-warning-500 rounded"></div>
                <div className="w-full h-6 bg-warning-600 rounded"></div>
                <div className="w-full h-6 bg-warning-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-body-small font-semibold text-text-primary">Error</h4>
              <div className="space-y-1">
                <div className="w-full h-8 bg-error-500 rounded"></div>
                <div className="w-full h-6 bg-error-600 rounded"></div>
                <div className="w-full h-6 bg-error-700 rounded"></div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StyleGuide;
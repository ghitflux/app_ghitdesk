import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody } from '@heroui/card';

const meta: Meta<typeof Tabs> = {
  title: 'HeroUI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs aria-label="Options">
      <Tab key="photos" title="Photos">
        <Card>
          <CardBody>
            <p>Photos content</p>
          </CardBody>
        </Card>
      </Tab>
      <Tab key="music" title="Music">
        <Card>
          <CardBody>
            <p>Music content</p>
          </CardBody>
        </Card>
      </Tab>
      <Tab key="videos" title="Videos">
        <Card>
          <CardBody>
            <p>Videos content</p>
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      <Tabs aria-label="Primary" color="primary">
        <Tab key="tab1" title="Primary" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
      <Tabs aria-label="Success" color="success">
        <Tab key="tab1" title="Success" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
      <Tabs aria-label="Warning" color="warning">
        <Tab key="tab1" title="Warning" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <Tabs aria-label="Solid" variant="solid" color="primary">
        <Tab key="tab1" title="Solid" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
      <Tabs aria-label="Underlined" variant="underlined" color="primary">
        <Tab key="tab1" title="Underlined" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
      <Tabs aria-label="Bordered" variant="bordered" color="primary">
        <Tab key="tab1" title="Bordered" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
      <Tabs aria-label="Light" variant="light" color="primary">
        <Tab key="tab1" title="Light" />
        <Tab key="tab2" title="Tab 2" />
        <Tab key="tab3" title="Tab 3" />
      </Tabs>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs aria-label="Disabled tabs" color="primary">
      <Tab key="tab1" title="Active" />
      <Tab key="tab2" title="Disabled" isDisabled />
      <Tab key="tab3" title="Active" />
    </Tabs>
  ),
};

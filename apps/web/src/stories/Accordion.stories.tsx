import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem } from '@heroui/accordion';

const meta: Meta<typeof Accordion> = {
  title: 'HeroUI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion className="w-full max-w-md">
      <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </AccordionItem>
      <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </AccordionItem>
      <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur.
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion selectionMode="multiple" className="w-full max-w-md">
      <AccordionItem key="1" aria-label="Feature 1" title="What is GhitDesk?">
        GhitDesk is an omnichannel helpdesk platform that allows you to manage
        customer support across multiple channels like WhatsApp, Email, and more.
      </AccordionItem>
      <AccordionItem key="2" aria-label="Feature 2" title="How does it work?">
        GhitDesk centralizes all your customer conversations in one place,
        allowing your team to respond efficiently and track performance metrics.
      </AccordionItem>
      <AccordionItem key="3" aria-label="Feature 3" title="What channels are supported?">
        Currently, we support WhatsApp, Email, Telegram, and Twitter. More
        channels are coming soon!
      </AccordionItem>
    </Accordion>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Accordion variant="light">
        <AccordionItem key="1" title="Light Variant">
          This is a light variant accordion item.
        </AccordionItem>
      </Accordion>
      <Accordion variant="shadow">
        <AccordionItem key="1" title="Shadow Variant">
          This is a shadow variant accordion item.
        </AccordionItem>
      </Accordion>
      <Accordion variant="bordered">
        <AccordionItem key="1" title="Bordered Variant">
          This is a bordered variant accordion item.
        </AccordionItem>
      </Accordion>
      <Accordion variant="splitted">
        <AccordionItem key="1" title="Splitted Variant">
          This is a splitted variant accordion item.
        </AccordionItem>
        <AccordionItem key="2" title="Another Item">
          Second item in splitted accordion.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const WithSubtitle: Story = {
  render: () => (
    <Accordion className="w-full max-w-md">
      <AccordionItem
        key="1"
        aria-label="Pricing"
        title="Pricing"
        subtitle="Press to expand"
      >
        Our pricing is flexible and scales with your team size. Contact us for
        a custom quote.
      </AccordionItem>
      <AccordionItem
        key="2"
        aria-label="Support"
        title="Support"
        subtitle="24/7 available"
      >
        We provide 24/7 customer support via chat, email, and phone.
      </AccordionItem>
      <AccordionItem
        key="3"
        aria-label="Security"
        title="Security"
        subtitle="Enterprise-grade"
      >
        Your data is encrypted at rest and in transit. We are SOC 2 Type II
        certified.
      </AccordionItem>
    </Accordion>
  ),
};

export const Compact: Story = {
  render: () => (
    <Accordion isCompact className="w-full max-w-md">
      <AccordionItem key="1" title="Compact Item 1">
        This is a compact accordion item with less padding.
      </AccordionItem>
      <AccordionItem key="2" title="Compact Item 2">
        Compact items are useful for dense layouts.
      </AccordionItem>
      <AccordionItem key="3" title="Compact Item 3">
        They save vertical space while maintaining readability.
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultExpanded: Story = {
  render: () => (
    <Accordion defaultExpandedKeys={['1']} className="w-full max-w-md">
      <AccordionItem key="1" title="Expanded by Default">
        This item is expanded when the component mounts.
      </AccordionItem>
      <AccordionItem key="2" title="Collapsed by Default">
        This item starts collapsed.
      </AccordionItem>
      <AccordionItem key="3" title="Also Collapsed">
        This one too.
      </AccordionItem>
    </Accordion>
  ),
};

export const FAQ: Story = {
  render: () => (
    <Accordion variant="splitted" className="w-full max-w-md">
      <AccordionItem
        key="1"
        title="How do I create a ticket?"
        subtitle="Creating tickets"
      >
        You can create a ticket by clicking the &quot;New Ticket&quot; button on the
        dashboard, or tickets are automatically created when customers contact
        you through any channel.
      </AccordionItem>
      <AccordionItem
        key="2"
        title="Can I assign tickets to team members?"
        subtitle="Team management"
      >
        Yes! You can assign tickets to specific agents or let our smart routing
        system distribute them automatically based on availability and expertise.
      </AccordionItem>
      <AccordionItem
        key="3"
        title="What are SLA policies?"
        subtitle="Service level agreements"
      >
        SLA policies define response and resolution time targets for tickets
        based on priority. You can customize these policies in the settings.
      </AccordionItem>
      <AccordionItem
        key="4"
        title="How do I integrate WhatsApp?"
        subtitle="Integrations"
      >
        Go to Settings → Integrations → WhatsApp and follow the setup wizard.
        You&apos;ll need a WhatsApp Business API account.
      </AccordionItem>
    </Accordion>
  ),
};

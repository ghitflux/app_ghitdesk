import type { Meta, StoryObj } from '@storybook/react';
import { Button, Input, Textarea, Select, SelectItem, Checkbox } from '@heroui/react';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

// Form is not a single component, but a composition pattern
const FormComponent = ({ children }: { children: React.ReactNode }) => (
  <form className="w-full max-w-md space-y-4">{children}</form>
);

const meta: Meta<typeof FormComponent> = {
  title: 'HeroUI/Form',
  component: FormComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginForm: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        startContent={<Mail size={18} className="text-default-400" />}
        isRequired
      />
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        startContent={<Lock size={18} className="text-default-400" />}
        isRequired
      />
      <Checkbox>Remember me</Checkbox>
      <Button type="submit" color="primary" className="w-full">
        Sign In
      </Button>
    </form>
  ),
};

export const RegisterForm: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Create Account</h2>
      <Input
        label="Full Name"
        placeholder="Enter your name"
        startContent={<UserIcon size={18} className="text-default-400" />}
        isRequired
      />
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        startContent={<Mail size={18} className="text-default-400" />}
        isRequired
      />
      <Input
        type="password"
        label="Password"
        placeholder="Create a password"
        startContent={<Lock size={18} className="text-default-400" />}
        isRequired
      />
      <Input
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        startContent={<Lock size={18} className="text-default-400" />}
        isRequired
      />
      <Checkbox isRequired>
        I agree to the terms and conditions
      </Checkbox>
      <Button type="submit" color="primary" className="w-full">
        Sign Up
      </Button>
    </form>
  ),
};

export const ContactForm: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Contact Us</h2>
      <Input
        label="Name"
        placeholder="Your name"
        isRequired
      />
      <Input
        type="email"
        label="Email"
        placeholder="your@email.com"
        isRequired
      />
      <Select
        label="Subject"
        placeholder="Select a subject"
        isRequired
      >
        <SelectItem key="support">Technical Support</SelectItem>
        <SelectItem key="sales">Sales Inquiry</SelectItem>
        <SelectItem key="feedback">Feedback</SelectItem>
        <SelectItem key="other">Other</SelectItem>
      </Select>
      <Textarea
        label="Message"
        placeholder="Enter your message"
        minRows={4}
        isRequired
      />
      <div className="flex gap-2">
        <Button type="button" variant="flat">
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Send Message
        </Button>
      </div>
    </form>
  ),
};

export const TicketForm: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">New Ticket</h2>
      <Input
        label="Subject"
        placeholder="Brief description of the issue"
        isRequired
      />
      <Select
        label="Priority"
        placeholder="Select priority"
        defaultSelectedKeys={['medium']}
        isRequired
      >
        <SelectItem key="low">Low</SelectItem>
        <SelectItem key="medium">Medium</SelectItem>
        <SelectItem key="high">High</SelectItem>
        <SelectItem key="urgent">Urgent</SelectItem>
      </Select>
      <Select
        label="Category"
        placeholder="Select category"
        isRequired
      >
        <SelectItem key="technical">Technical Issue</SelectItem>
        <SelectItem key="billing">Billing</SelectItem>
        <SelectItem key="feature">Feature Request</SelectItem>
        <SelectItem key="other">Other</SelectItem>
      </Select>
      <Textarea
        label="Description"
        placeholder="Provide detailed information about the issue"
        minRows={4}
        isRequired
      />
      <div className="flex gap-2">
        <Button type="button" variant="flat">
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Create Ticket
        </Button>
      </div>
    </form>
  ),
};

export const ProfileForm: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Edit Profile</h2>
      <Input
        label="Full Name"
        defaultValue="João Silva"
        isRequired
      />
      <Input
        type="email"
        label="Email"
        defaultValue="joao@ghitdesk.com"
        isRequired
        isDisabled
      />
      <Select
        label="Role"
        placeholder="Select role"
        defaultSelectedKeys={['agent']}
        isRequired
      >
        <SelectItem key="admin">Administrator</SelectItem>
        <SelectItem key="supervisor">Supervisor</SelectItem>
        <SelectItem key="agent">Agent</SelectItem>
      </Select>
      <Input
        label="Phone"
        placeholder="+55 (11) 99999-9999"
      />
      <Textarea
        label="Bio"
        placeholder="Tell us about yourself"
        minRows={3}
      />
      <div className="flex gap-2">
        <Button type="button" variant="flat">
          Cancel
        </Button>
        <Button type="submit" color="primary">
          Save Changes
        </Button>
      </div>
    </form>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <form className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Form with Validation</h2>
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        isInvalid
        errorMessage="Please enter a valid email"
      />
      <Input
        type="password"
        label="Password"
        placeholder="Enter password"
        description="Password must be at least 8 characters"
      />
      <Input
        label="Username"
        placeholder="Enter username"
        description="Available"
        color="success"
      />
      <Button type="submit" color="primary" className="w-full">
        Submit
      </Button>
    </form>
  ),
};

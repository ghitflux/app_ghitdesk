import type { Meta, StoryObj } from '@storybook/react';
import { InputOtp } from '@heroui/input-otp';

const meta: Meta<typeof InputOtp> = {
  title: 'HeroUI/InputOtp',
  component: InputOtp,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    length: 6,
    'aria-label': 'OTP Input',
  },
};

export const FourDigits: Story = {
  args: {
    length: 4,
    'aria-label': '4-digit OTP',
  },
};

export const SixDigits: Story = {
  args: {
    length: 6,
    'aria-label': '6-digit OTP',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOtp length={6} variant="flat" />
      <InputOtp length={6} variant="bordered" />
      <InputOtp length={6} variant="underlined" />
      <InputOtp length={6} variant="faded" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOtp length={6} color="default" />
      <InputOtp length={6} color="primary" />
      <InputOtp length={6} color="secondary" />
      <InputOtp length={6} color="success" />
      <InputOtp length={6} color="warning" />
      <InputOtp length={6} color="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOtp length={6} size="sm" />
      <InputOtp length={6} size="md" />
      <InputOtp length={6} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    length: 6,
    isDisabled: true,
  },
};

export const Invalid: Story = {
  args: {
    length: 6,
    isInvalid: true,
  },
};

export const TwoFactorAuth: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center max-w-md">
      <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
      <p className="text-sm text-default-500 text-center">
        Enter the 6-digit code from your authenticator app
      </p>
      <InputOtp length={6} color="primary" />
      <button className="text-sm text-primary hover:underline">
        Didn&apos;t receive code? Resend
      </button>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Verification Code</label>
      <InputOtp length={6} />
      <p className="text-xs text-default-500">
        Check your email for the verification code
      </p>
    </div>
  ),
};

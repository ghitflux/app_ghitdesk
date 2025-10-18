import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@heroui/skeleton';
import { Card, CardHeader, CardBody } from '@heroui/card';

const meta: Meta<typeof Skeleton> = {
  title: 'HeroUI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-3">
      <Skeleton className="rounded-lg">
        <div className="h-24 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-2">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </div>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <Card className="w-[400px] space-y-5 p-4">
      <Skeleton className="rounded-lg">
        <div className="h-24 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Skeleton className="flex rounded-full w-12 h-12" />
          <div className="flex flex-col gap-2 items-start justify-center">
            <Skeleton className="w-32 rounded-lg">
              <div className="h-3 w-32 rounded-lg bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-24 rounded-lg">
              <div className="h-2 w-24 rounded-lg bg-default-300"></div>
            </Skeleton>
          </div>
        </div>
        <Skeleton className="rounded-lg">
          <div className="h-10 w-20 rounded-lg bg-default-300"></div>
        </Skeleton>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <Skeleton className="w-full rounded-lg">
            <div className="h-3 w-full rounded-lg bg-default-200"></div>
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg">
            <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      </CardBody>
    </Card>
  ),
};

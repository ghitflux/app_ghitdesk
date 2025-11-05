import type { Meta, StoryObj } from '@storybook/react';
import { Image } from '@heroui/image';

const meta: Meta<typeof Image> = {
  title: 'HeroUI/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    alt: 'Office desk setup',
    width: 400,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-start flex-wrap">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="Small"
        width={200}
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300"
        alt="Medium"
        width={300}
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
        alt="Large"
        width={400}
      />
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="None"
        width={200}
        radius="none"
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="Small"
        width={200}
        radius="sm"
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="Medium"
        width={200}
        radius="md"
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="Large"
        width={200}
        radius="lg"
      />
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200"
        alt="Full"
        width={200}
        radius="full"
      />
    </div>
  ),
};

export const WithShadow: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    alt: 'With shadow',
    width: 400,
    shadow: 'lg',
  },
};

export const Loading: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    alt: 'Loading state',
    width: 400,
    isLoading: true,
  },
};

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Image
          key={i}
          src={`https://images.unsplash.com/photo-${1555041469 + i}-a586c61ea9bc?w=300`}
          alt={`Gallery ${i}`}
          width={200}
          height={200}
          className="object-cover"
        />
      ))}
    </div>
  ),
};

export const Blurred: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    alt: 'Blurred',
    width: 400,
    isBlurred: true,
  },
};

export const ZoomedCover: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    alt: 'Zoomed',
    width: 300,
    height: 200,
    isZoomed: true,
  },
};

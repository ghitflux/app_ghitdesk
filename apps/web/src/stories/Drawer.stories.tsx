import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button, useDisclosure } from '@heroui/react';
import { Settings, User, Bell } from 'lucide-react';

const meta: Meta<typeof Drawer> = {
  title: 'HeroUI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Button onPress={onOpen}>Open Drawer</Button>
        <Drawer isOpen={isOpen} onClose={onClose}>
          <DrawerContent>
            <DrawerHeader>Drawer Title</DrawerHeader>
            <DrawerBody>
              <p>This is the drawer content.</p>
            </DrawerBody>
            <DrawerFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};

export const Placements: Story = {
  render: () => {
    const { isOpen: isLeftOpen, onOpen: onLeftOpen, onClose: onLeftClose } = useDisclosure();
    const { isOpen: isRightOpen, onOpen: onRightOpen, onClose: onRightClose } = useDisclosure();
    const { isOpen: isTopOpen, onOpen: onTopOpen, onClose: onTopClose } = useDisclosure();
    const { isOpen: isBottomOpen, onOpen: onBottomOpen, onClose: onBottomClose } = useDisclosure();

    return (
      <div className="flex gap-4 flex-wrap">
        <Button onPress={onLeftOpen}>Left</Button>
        <Button onPress={onRightOpen}>Right</Button>
        <Button onPress={onTopOpen}>Top</Button>
        <Button onPress={onBottomOpen}>Bottom</Button>

        <Drawer placement="left" isOpen={isLeftOpen} onClose={onLeftClose}>
          <DrawerContent>
            <DrawerHeader>Left Drawer</DrawerHeader>
            <DrawerBody>Content from the left side</DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer placement="right" isOpen={isRightOpen} onClose={onRightClose}>
          <DrawerContent>
            <DrawerHeader>Right Drawer</DrawerHeader>
            <DrawerBody>Content from the right side</DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer placement="top" isOpen={isTopOpen} onClose={onTopClose}>
          <DrawerContent>
            <DrawerHeader>Top Drawer</DrawerHeader>
            <DrawerBody>Content from the top</DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer placement="bottom" isOpen={isBottomOpen} onClose={onBottomClose}>
          <DrawerContent>
            <DrawerHeader>Bottom Drawer</DrawerHeader>
            <DrawerBody>Content from the bottom</DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

export const UserProfile: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Button onPress={onOpen} startContent={<User size={18} />}>
          User Profile
        </Button>
        <Drawer isOpen={isOpen} onClose={onClose} placement="right">
          <DrawerContent>
            <DrawerHeader className="flex items-center gap-2">
              <User size={20} />
              User Profile
            </DrawerHeader>
            <DrawerBody className="space-y-4">
              <div>
                <h3 className="font-semibold">João Silva</h3>
                <p className="text-sm text-default-500">joao@ghitdesk.com</p>
              </div>
              <div className="space-y-2">
                <Button variant="flat" fullWidth>
                  <Settings size={16} />
                  Settings
                </Button>
                <Button variant="flat" fullWidth>
                  <Bell size={16} />
                  Notifications
                </Button>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Logout
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const { isOpen: isSmOpen, onOpen: onSmOpen, onClose: onSmClose } = useDisclosure();
    const { isOpen: isMdOpen, onOpen: onMdOpen, onClose: onMdClose } = useDisclosure();
    const { isOpen: isLgOpen, onOpen: onLgOpen, onClose: onLgClose } = useDisclosure();

    return (
      <div className="flex gap-4">
        <Button onPress={onSmOpen}>Small</Button>
        <Button onPress={onMdOpen}>Medium</Button>
        <Button onPress={onLgOpen}>Large</Button>

        <Drawer size="sm" isOpen={isSmOpen} onClose={onSmClose}>
          <DrawerContent>
            <DrawerHeader>Small Drawer</DrawerHeader>
            <DrawerBody>Small size content</DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer size="md" isOpen={isMdOpen} onClose={onMdClose}>
          <DrawerContent>
            <DrawerHeader>Medium Drawer</DrawerHeader>
            <DrawerBody>Medium size content</DrawerBody>
          </DrawerContent>
        </Drawer>

        <Drawer size="lg" isOpen={isLgOpen} onClose={onLgClose}>
          <DrawerContent>
            <DrawerHeader>Large Drawer</DrawerHeader>
            <DrawerBody>Large size content</DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

export const WithBackdrop: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Button onPress={onOpen}>Open with Backdrop</Button>
        <Drawer isOpen={isOpen} onClose={onClose} backdrop="blur">
          <DrawerContent>
            <DrawerHeader>Drawer with Blur Backdrop</DrawerHeader>
            <DrawerBody>
              <p>Click outside or press ESC to close.</p>
            </DrawerBody>
            <DrawerFooter>
              <Button onPress={onClose}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};

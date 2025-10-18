import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';

const meta: Meta<typeof Modal> = {
  title: 'HeroUI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
      <>
        <Button onPress={onOpen} color="primary">
          Open Modal
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
                <ModalBody>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus
                    non risus hendrerit venenatis.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Action
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
      <div className="flex gap-3">
        <Button onPress={onOpen} color="primary" size="sm">
          Open Small
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Small Modal</ModalHeader>
                <ModalBody>
                  <p>This is a small modal.</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  },
};

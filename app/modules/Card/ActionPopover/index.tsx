import ConfirmModal from "@/app/common/components/Modal/ConfirmModal";
import Popover from "@/app/common/components/Popover";
import { ShareAltOutlined } from "@ant-design/icons";
import {
  Box,
  IconDotsHorizontal,
  IconDuplicate,
  IconTrash,
  Stack,
  Text,
} from "degen";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import styled from "styled-components";
import { useLocalCard } from "../../Project/CreateCardModal/hooks/LocalCardContext";

const ScrollContainer = styled(Box)`
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  max-height: 14rem;
  overflow-y: auto;
`;

const PopoverOptionContainer = styled(Box)`
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

type PopoverOptionProps = {
  onClick: () => void;
  children: React.ReactNode;
};

const PopoverOption = ({ children, onClick }: PopoverOptionProps) => (
  <PopoverOptionContainer
    padding="3"
    overflow="hidden"
    cursor="pointer"
    onClick={onClick}
  >
    <Text variant="small" weight="semiBold" ellipsis>
      {children}
    </Text>
  </PopoverOptionContainer>
);

export default function ActionPopover() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { onArchive } = useLocalCard();
  return (
    <>
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            title="Are you sure you want to archive this card?"
            handleClose={() => setShowConfirm(false)}
            onConfirm={() => {
              setShowConfirm(false);
              void onArchive();
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      <Popover
        icon={<IconDotsHorizontal />}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <ScrollContainer
          backgroundColor="backgroundSecondary"
          borderWidth="0.5"
          borderRadius="2xLarge"
          width="36"
        >
          <PopoverOption
            onClick={() => {
              setIsOpen(false);
              setShowConfirm(true);
            }}
          >
            <Stack direction="horizontal" space="2">
              <IconTrash color="red" />
              Archive
            </Stack>
          </PopoverOption>
          <PopoverOption onClick={() => {}}>
            <Stack direction="horizontal" space="2">
              <IconDuplicate />
              Duplicate
            </Stack>
          </PopoverOption>
          <PopoverOption onClick={() => {}}>
            <Stack direction="horizontal" space="2">
              <ShareAltOutlined
                style={{
                  fontSize: "1.5rem",
                }}
              />
              Share
            </Stack>
          </PopoverOption>
        </ScrollContainer>
      </Popover>
    </>
  );
}

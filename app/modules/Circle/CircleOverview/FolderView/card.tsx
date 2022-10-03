import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { Box, Text, useTheme, Stack, IconUserGroup, IconEth } from "degen";
import { CircleType, ProjectType, RetroType } from "@/app/types";
import styled from "styled-components";
import { ProjectOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

interface Props {
  card: string;
  index: number;
  projects?: {
    [key: string]: ProjectType;
  };
  workstreams?: {
    [key: string]: CircleType;
  };
  retros?: {
    [key: string]: RetroType;
  };
}

const Container = styled(Box)<{ isDragging: boolean; mode: string }>`
  border-width: 2px;
  border-color: ${(props) =>
    props.isDragging
      ? "rgb(191, 90, 242, 1)"
      : props.mode === "dark"
      ? "rgb(255, 255, 255, 0.05)"
      : "rgb(20,20,20,0.05)"};
  };
  &:hover {
    border-color: ${(props) =>
      props.mode === "dark" ? "rgb(255, 255, 255, 0.1)" : "rgb(20,20,20,0.1)"};
  }
  color: rgb(191, 90, 242, 0.5);
`;

const Card = ({ card, index, projects, workstreams, retros }: Props) => {
  const { mode } = useTheme();
  const router = useRouter();
  const { circle: cId } = router.query;

  const DraggableContent = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => (
    <Container
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      padding="4"
      marginBottom="2"
      borderRadius="large"
      isDragging={snapshot.isDragging}
      mode={mode}
      onClick={() => {
        if (projects?.[card]?.slug) {
          void router.push(`/${cId}/${projects?.[card]?.slug}`);
        }
        if (workstreams?.[card]?.slug) {
          void router.push(`/${workstreams?.[card]?.slug}`);
        }
        if (retros?.[card]?.slug) {
          void router.push(`/${cId}?retroSlug=${retros?.[card]?.slug}`);
        }
      }}
    >
      <Stack direction={"horizontal"} align="center">
        {projects?.[card]?.id && (
          <ProjectOutlined style={{ fontSize: "1.1rem" }} />
        )}
        {workstreams?.[card].id && <IconUserGroup />}
        {retros?.[card]?.id && <IconEth />}
        <Text>
          {projects?.[card]?.name ||
            workstreams?.[card].name ||
            retros?.[card].title}
        </Text>
      </Stack>
    </Container>
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DraggableContentCallback = useCallback(DraggableContent, [
    projects,
    card,
    workstreams,
    retros,
  ]);

  return (
    <Draggable draggableId={card} index={index}>
      {DraggableContentCallback}
    </Draggable>
  );
};

export default memo(Card);

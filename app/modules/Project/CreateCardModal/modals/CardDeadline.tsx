import { Box, Stack, Text } from "degen";
import React, { forwardRef, memo, useRef } from "react";
import { useLocalCard } from "../hooks/LocalCardContext";
import { CalendarOutlined } from "@ant-design/icons";
import useRoleGate from "@/app/services/RoleGate/useRoleGate";
import ReactDatePicker from "react-datepicker";
import ClickableTag from "@/app/common/components/EditTag/ClickableTag";

function CardDeadline() {
  const { deadline, setDeadline, onCardUpdate } = useLocalCard();
  const { canTakeAction } = useRoleGate();
  const dateRef = useRef<any>(null);

  // eslint-disable-next-line react/display-name
  const ExampleCustomInput = forwardRef(({ value, onClick }: any, ref) => (
    <Box onClick={onClick} ref={ref as any}>
      <ClickableTag
        name={deadline?.getDate ? value : "None"}
        icon={
          <CalendarOutlined
            style={{
              fontSize: "1rem",
              marginLeft: "0.2rem",
              marginRight: "0.2rem",
              color: "rgb(191, 90, 242, 1)",
            }}
          />
        }
        onClick={() => void 0}
      />
    </Box>
  ));

  return (
    <Stack direction="horizontal">
      <Box width="1/3">
        <Text variant="label">Deadline</Text>
      </Box>
      <Box width="2/3">
        <ReactDatePicker
          ref={dateRef}
          selected={deadline?.getDay ? deadline : new Date()}
          onChange={(date: Date) => {
            if (date === deadline) {
              setDeadline(null);
              setTimeout(() => {
                void onCardUpdate();
              }, 500);
              return;
            }
            setDeadline(date);
          }}
          customInput={<ExampleCustomInput />}
          disabled={!canTakeAction("cardDeadline")}
          onCalendarClose={() => {
            void onCardUpdate();
          }}
        />
      </Box>
    </Stack>
  );
}

export default memo(CardDeadline);

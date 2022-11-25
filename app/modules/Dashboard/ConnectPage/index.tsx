import { Box, Stack, IconSparkles, Heading } from "degen";
import { Connect } from "@/app/modules/Sidebar/ProfileButton/ConnectButton";
import styled from "styled-components";
import SocialMedia from "@/app/common/components/SocialMedia";

export const VioletBlur = styled.div`
  filter: blur(150px);
  height: 200px;
  width: 200px;
  border-radius: 100px;
  background: linear-gradient(126.86deg, #5200ff 0%, #a900ff 100%);
  position: absolute;
  z-index: 0;
`;

export default function ConnectPage() {
  return (
    <Box position={"relative"} display="flex" width={"full"} gap="11">
      {/* <VioletBlur style={{ bottom: "0px", left: "80rem" }} /> */}
      <Box
        style={{
          margin: "40vh auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <Stack
          justify={"center"}
          direction={{ xs: "vertical", md: "horizontal", lg: "horizontal" }}
          align="center"
        >
          <IconSparkles color="accent" size="8"/>
          <Heading responsive align={"center"}>
            Connect your wallet to explore the world of Spect
          </Heading>
        </Stack>
        <Connect />
        <SocialMedia />
      </Box>

      <VioletBlur style={{ top: "0px", left: "0rem" }} />
    </Box>
  );
}

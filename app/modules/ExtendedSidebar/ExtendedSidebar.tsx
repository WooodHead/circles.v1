import React, { ReactElement } from "react";
import { Box } from "degen";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import ExploreSidebar from "./ExploreSidebar";
import CircleSidebar from "./CircleSidebar";
import ProfileModal from "../Header/ProfileModal";
import { useQuery } from "react-query";
import { UserType } from "@/app/types";
import ConnectModal from "../Header/ConnectModal";

function ExtendedSidebar(): ReactElement {
  const router = useRouter();
  const { circle: cId } = router.query;
  const { data: currentUser } = useQuery<UserType>("getMyUser", {
    enabled: false,
  });

  return (
    <motion.div
      key="content"
      initial="collapsed"
      animate="open"
      exit="collapsed"
      variants={{
        open: { width: "300px", opacity: 1, minWidth: "300px" },
        collapsed: { width: 0, opacity: 0, minWidth: "0px" },
      }}
      transition={{ duration: 0.5 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        borderRightWidth="0.375"
        paddingLeft="3"
        paddingRight="3"
        height="full"
      >
        {!cId && <ExploreSidebar />}
        {cId && <CircleSidebar />}
        {currentUser?.id && <ProfileModal />}
        {!currentUser?.id && cId && <ConnectModal />}
      </Box>
    </motion.div>
  );
}

export default ExtendedSidebar;

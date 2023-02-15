import Modal from "@/app/common/components/Modal";
import PrimaryButton from "@/app/common/components/PrimaryButton";
import { Box, Stack, Text } from "degen";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Cpu } from "react-feather";
import styled from "styled-components";
import { useCircle } from "../Circle/CircleContext";
import { useLocalCollection } from "../Collection/Context/LocalCollectionContext";
import DistributeERC20 from "./erc20";
import SybilResistance from "./gtcpassport";
import RoleGate from "./guildxyz";
import SendKudos from "./mintkudos";
import Payments from "./payments";
import { SpectPlugin, spectPlugins } from "./Plugins";

type Props = {};

export default function ViewPlugins({}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPluginOpen, setIsPluginOpen] = useState(false);
  const [pluginOpen, setPluginOpen] = useState("");

  const { localCollection: collection } = useLocalCollection();

  const onClick = (pluginName: string) => {
    switch (pluginName) {
      case "guildxyz":
        setIsPluginOpen(true);
        setPluginOpen(pluginName);
        break;
      case "gtcpassport":
        setIsPluginOpen(true);
        setPluginOpen(pluginName);
        break;
      case "mintkudos":
        setIsPluginOpen(true);
        setPluginOpen(pluginName);
        break;
      case "payments":
        setIsPluginOpen(true);
        setPluginOpen(pluginName);
        break;
      case "erc20":
        setIsPluginOpen(true);
        setPluginOpen(pluginName);
        break;
      default:
        break;
    }
  };

  const isPluginAdded = (pluginName: string) => {
    switch (pluginName) {
      case "guildxyz":
        return !!collection.formMetadata.formRoleGating;
      case "gtcpassport":
        return collection.formMetadata.sybilProtectionEnabled === true;
      case "mintkudos":
        return !!collection.formMetadata.mintkudosTokenId;
      case "payments":
        return !!collection.formMetadata.paymentConfig;
      case "erc20":
        return !!collection.formMetadata.surveyTokenId;
      default:
        return false;
    }
  };

  return (
    <Box>
      <PrimaryButton
        onClick={() => {
          setIsOpen(true);
        }}
        icon={<Cpu />}
      >
        Add Plugins
      </PrimaryButton>
      <AnimatePresence>
        {isOpen && (
          <Modal
            handleClose={() => setIsOpen(false)}
            title="Plugins"
            size="large"
            key="plugins"
          >
            <Box padding="8">
              <Stack>
                {/* <Text variant="label">Added Plugins</Text>
                <Stack direction="horizontal" wrap space="4">
                  {Object.keys(spectPlugins).map((pluginName) => (
                    <PluginCard
                      key={pluginName}
                      plugin={spectPlugins[pluginName]}
                      onClick={() => onClick(pluginName)}
                      added={isPluginAdded(pluginName)}
                    />
                  ))}
                </Stack> */}
                <Text variant="label">Explore Plugins</Text>
                <Stack direction="horizontal" wrap space="4">
                  {Object.keys(spectPlugins).map((pluginName) => (
                    <PluginCard
                      key={pluginName}
                      plugin={spectPlugins[pluginName]}
                      onClick={() => onClick(pluginName)}
                      added={isPluginAdded(pluginName)}
                    />
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Modal>
        )}
        {isPluginOpen && pluginOpen === "guildxyz" && (
          <RoleGate handleClose={() => setIsPluginOpen(false)} key="guildxyz" />
        )}
        {isPluginOpen && pluginOpen === "gtcpassport" && (
          <SybilResistance
            handleClose={() => setIsPluginOpen(false)}
            key="gtcpassport"
          />
        )}
        {isPluginOpen && pluginOpen === "mintkudos" && (
          <SendKudos
            handleClose={() => setIsPluginOpen(false)}
            key="mintkudos"
          />
        )}
        {isPluginOpen && pluginOpen === "payments" && (
          <Payments handleClose={() => setIsPluginOpen(false)} key="payments" />
        )}
        {isPluginOpen && pluginOpen === "erc20" && (
          <DistributeERC20
            handleClose={() => setIsPluginOpen(false)}
            key="erc20"
          />
        )}
      </AnimatePresence>
    </Box>
  );
}

const PluginCard = ({
  plugin,
  onClick,
  added,
}: {
  plugin: SpectPlugin;
  onClick: () => void;
  added?: boolean;
}) => {
  return (
    <PluginContainer
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ position: "relative" }}
    >
      {added && (
        <PluginAdded>
          <Text color="accent" size="large">
            Added
          </Text>
        </PluginAdded>
      )}
      <PluginImage src={plugin.image} />
      <Box padding="4">
        <Stack>
          <Text weight="bold">{plugin.name}</Text>
          <Text>{plugin.description}</Text>
          {/* <a href={plugin.docs} target="_blank">
            <Text color="accent">View Docs</Text>
          </a> */}
        </Stack>
      </Box>
    </PluginContainer>
  );
};

const PluginContainer = styled(motion.div)`
  width: calc(100% / 3 - 1rem);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
`;

const PluginImage = styled.img`
  width: 100%;
  height: 14rem;
  object-fit: cover;
  border-radius: 1rem 1rem 0 0;
`;

const PluginAdded = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(20, 20, 20);
  padding: 0.5rem 1rem;
  border-radius: 0 1rem 0 1rem;
`;

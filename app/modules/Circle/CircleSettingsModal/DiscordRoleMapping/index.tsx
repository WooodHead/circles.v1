import Loader from "@/app/common/components/Loader";
import Modal from "@/app/common/components/Modal";
import PrimaryButton from "@/app/common/components/PrimaryButton";
import { getGuildRoles } from "@/app/services/Discord";
import { updateCircle } from "@/app/services/UpdateCircle";
import { Box, IconClose, Stack, Tag, Text } from "degen";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCircle } from "../../CircleContext";
import RolePopover from "./RolePopover";

export default function DiscordRoleMapping() {
  const [isOpen, setIsOpen] = useState(false);
  const { circle } = useCircle();
  const [roleMap, setRoleMap] = useState(circle?.discordToCircleRoles || {});
  const [loading, setLoading] = useState(false);

  const [discordRoles, setDiscordRoles] =
    useState<
      | {
          id: string;
          name: string;
        }[]
      | undefined
    >();

  useEffect(() => {
    if (isOpen) {
      const fetchGuildRoles = async () => {
        const data = await getGuildRoles(circle?.discordGuildId);
        data && setDiscordRoles(data.roles);
        console.log({ data });
      };
      void fetchGuildRoles();
    }
  }, [circle?.discordGuildId, isOpen]);

  if (!discordRoles?.map && isOpen) {
    return <Loader loading text="Fetching Roles" />;
  }
  const RoleSection = ({ roleName }: { roleName: string }) => (
    <Box>
      <Text size="headingTwo" weight="semiBold">
        {roleName}
      </Text>
      <Stack direction="horizontal" wrap align="center">
        <RolePopover
          roles={discordRoles as any}
          setRoleMap={setRoleMap}
          roleMap={roleMap}
          circleRole={roleName}
        />
        {roleMap &&
          Object.keys(roleMap).map((role) => {
            if (roleMap[role].circleRole.includes(roleName))
              return (
                <Box
                  key={role}
                  cursor="pointer"
                  onClick={() => {
                    if (roleMap[role].circleRole.length > 1) {
                      setRoleMap({
                        ...roleMap,
                        [role]: {
                          ...roleMap[role],
                          circleRole: roleMap[role].circleRole.filter(
                            (r) => r !== roleName
                          ),
                        },
                      });
                    } else {
                      delete roleMap[role];
                      setRoleMap({ ...roleMap });
                    }
                  }}
                >
                  <Tag hover tone="accent">
                    <Stack direction="horizontal" space="1" align="center">
                      <IconClose size="5" />
                      <Text>{roleMap[role].name}</Text>
                    </Stack>
                  </Tag>
                </Box>
              );
          })}
      </Stack>
    </Box>
  );

  if (!circle) {
    return <Loader loading text="Loading Roles" />;
  }

  return (
    <>
      <PrimaryButton
        variant="tertiary"
        onClick={() => {
          if (!circle.discordGuildId)
            toast.error(
              "You must connect your discord server to use this feature",
              {
                theme: "dark",
              }
            );
          else setIsOpen(true);
        }}
      >
        Map Discord Roles
      </PrimaryButton>
      <AnimatePresence>
        {isOpen && (
          <Modal title="Discord Roles" handleClose={() => setIsOpen(false)}>
            <Box paddingX="8" paddingY="4">
              <Stack>
                {Object.keys(circle.roles).map((role) => (
                  <RoleSection key={role} roleName={circle.roles[role].name} />
                ))}
                <PrimaryButton
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    await updateCircle(
                      {
                        discordToCircleRoles: roleMap,
                      },
                      circle.id
                    );
                    setLoading(false);
                    setIsOpen(false);
                  }}
                >
                  Save
                </PrimaryButton>
              </Stack>
            </Box>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

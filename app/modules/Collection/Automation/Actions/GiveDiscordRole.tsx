import Modal from "@/app/common/components/Modal";
import PrimaryButton from "@/app/common/components/PrimaryButton";
import { useCircle } from "@/app/modules/Circle/CircleContext";
import { Action } from "@/app/types";
import { Box, Stack, Tag, Text } from "degen";
import { useEffect, useState } from "react";
import DiscordIcon from "@/app/assets/icons/discordIcon.svg";
import { getGuildRoles } from "@/app/services/Discord";

type Props = {
  actionMode: "edit" | "create";
  action: Action;
  setAction: (action: Action) => void;
};

export default function GiveDiscordRole({
  setAction,
  actionMode,
  action,
}: Props) {
  const [selectedRoles, setSelectedRoles] = useState(
    (action.data?.roles || {}) as { [roleId: string]: boolean }
  );

  const { circle } = useCircle();
  const toggleSelectedRole = (roleId: string) => {
    setSelectedRoles({
      ...selectedRoles,
      [roleId]: !selectedRoles[roleId],
    });
  };

  useEffect(() => {
    setSelectedRoles(action.data?.roles || {});
  }, [action]);

  const [discordRoles, setDiscordRoles] =
    useState<
      | {
          id: string;
          name: string;
        }[]
      | undefined
    >();

  console.log({ discordRoles });

  useEffect(() => {
    const fetchGuildRoles = async () => {
      const data = await getGuildRoles(circle?.discordGuildId);
      data && setDiscordRoles(data.roles);
      console.log({ data });
    };
    void fetchGuildRoles();
  }, [circle?.discordGuildId]);

  if (!circle.discordGuildId)
    return (
      <Box
        width={{
          xs: "full",
          md: "1/3",
        }}
        onClick={() => {
          window.open(
            `https://discord.com/oauth2/authorize?client_id=942494607239958609&permissions=17448306704&redirect_uri=${
              process.env.NODE_ENV !== "production"
                ? "http://localhost:3000/"
                : "https://circles.spect.network/"
            }api/connectDiscord&response_type=code&scope=bot&state=${
              circle.slug
            }`,
            "_blank"
          );
        }}
      >
        <PrimaryButton
          icon={
            <Box marginTop="1">
              <DiscordIcon />
            </Box>
          }
        >
          Connect Discord
        </PrimaryButton>
      </Box>
    );

  return (
    <Box
      marginTop="4"
      onMouseLeave={() => {
        setAction({
          ...action,
          data: {
            ...action.data,
            roles: selectedRoles,
            circleId: circle.id,
          },
        });
      }}
    >
      <Box marginBottom="4">
        <Text variant="label">Pick the roles to give</Text>
      </Box>
      <Stack direction="horizontal" wrap>
        {discordRoles?.map((role) => {
          return (
            <Box
              key={role.id}
              cursor="pointer"
              onClick={() => toggleSelectedRole(role.id)}
            >
              {selectedRoles[role.id] ? (
                <Tag tone={"accent"} hover>
                  <Box paddingX="2">{role.name}</Box>
                </Tag>
              ) : (
                <Tag hover>
                  <Box paddingX="2">{role.name}</Box>
                </Tag>
              )}
            </Box>
          );
        })}{" "}
      </Stack>
    </Box>
  );
}

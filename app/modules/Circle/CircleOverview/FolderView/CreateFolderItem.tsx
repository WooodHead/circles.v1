import { Box, IconPlusSmall, Button } from "degen";
import { useState } from "react";

import CreateSpaceModal from "../../CreateSpaceModal";
import CreateProjectModal from "../../CreateProjectModal";
import CreateRetro from "@/app/modules/Retro/CreateRetro";
import CreateCollectionModal from "../../CreateCollectionModal";

function CreateFolderItem({ folderId }: { folderId: string }) {
  const [hover, setHover] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box display={"flex"} flexDirection={"row"} alignItems="center">
        <Button
          size="small"
          variant="transparent"
          shape="circle"
          data-tour="create-proj-workstream-retro"
        >
          <IconPlusSmall size={"5"} />
        </Button>
        {hover && (
          <Box
            transitionDuration={"700"}
            display={"flex"}
            flexDirection={"row"}
            gap={"3"}
            marginLeft="3"
          >
            <CreateProjectModal folderId={folderId} />
            <CreateSpaceModal folderId={folderId} />
            <CreateRetro folderId={folderId} />
            <CreateCollectionModal folderId={folderId} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CreateFolderItem;

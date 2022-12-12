import { Box, Button, useTheme, IconSparkles } from "degen";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import CollectionProject from "../CollectionProject";
import CollectionHeading from "./CollectionHeading";
import { useLocalCollection } from "./Context/LocalCollectionContext";
import { Form } from "./Form";
import TableView from "./TableView";
import FAQModal from "../Dashboard/FAQModal";

export function Collection() {
  const { view, setView, localCollection: collection } = useLocalCollection();
  const [faqOpen, setFaqOpen] = useState(false);
  const { mode } = useTheme();

  useEffect(() => {
    setView(0);
  }, [setView]);

  return (
    <>
      <ToastContainer
        toastStyle={{
          backgroundColor: `${
            mode === "dark" ? "rgb(20,20,20)" : "rgb(240,240,240)"
          }`,
          color: `${
            mode === "dark" ? "rgb(255,255,255,0.7)" : "rgb(20,20,20,0.7)"
          }`,
        }}
      />
      {collection.collectionType === 0 && (
        <Box>
          <CollectionHeading />
          {view === 0 && <Form />}
          <Box
            marginLeft={{
              xs: "2",
              md: "8",
            }}
            marginRight={{
              xs: "2",
              md: "8",
            }}
            marginTop="4"
          >
            {view === 1 && <TableView />}
          </Box>
          <Box
            style={{
              position: "absolute",
              right: "2rem",
              bottom: "1rem",
              zIndex: "2",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setFaqOpen(true)}
              shape="circle"
            >
              <IconSparkles size={"6"} />
            </Button>
          </Box>
          <AnimatePresence>
            {faqOpen && <FAQModal handleClose={() => setFaqOpen(false)} />}
          </AnimatePresence>
        </Box>
      )}
      {collection.collectionType === 1 && <CollectionProject />}
    </>
  );
}

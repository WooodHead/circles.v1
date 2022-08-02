import { Box, Button, IconChevronRight, Stack, Text, useTheme, Tag, IconClose } from "degen";
import { motion, AnimatePresence } from "framer-motion";
import { matchSorter } from "match-sorter";
import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export type OptionType = {
  name: string;
  id: string;
};

interface Props {
  title?: string;
  options: OptionType[];
  value: string[];
  setValue: (value: string[])=> void;
}

const OptionsContainer = styled(Box)<{ isExpanded: boolean }>`
  display: ${(props) => (props.isExpanded ? "block" : "none")};
  position: absolute;
  z-index: 1;
  width: 20rem;
`;

const Option = styled(Box)<{isSelected?: boolean}>`
  cursor: pointer;
  padding: 0.7rem;
  margin: 0.1rem;
  border-radius: 0.5rem;
  background-color: ${(props) => (props.isSelected ? "rgb(191, 90, 242, 0.2)" : "transparent")};
  &:hover {
    background-color: rgb(191, 90, 242, 0.2);
  }
`;

const ScrollContainer = styled(Box)<{mode: string}>`
  ::-webkit-scrollbar {
    width: 5px;
    height: 2rem;
  }
  ::-webkit-scrollbar-thumb {
    background: ${(props) => (props.mode === 'dark' ? "rgb(255, 255, 255, 0.3)" : "rgb(0, 0, 0, 0.2)")};
  }
  max-height: 25rem;
  overflow-y: auto;
  border: 2px solid ${(props) => (props.mode === 'dark' ? "rgb(255, 255, 255, 0.1);" : "rgb(0, 0, 0, 0.1)")};
  border-radius: 0.5rem;
`;

export const Input = styled.input`
  background-color: transparent;
  border: none;
  padding: 0.8rem;
  display: flex;
  border-style: none;
  border-color: transparent;
  outline: none;
  outline-offset: 0;
  box-shadow: none;
  font-size: 1rem;
  caret-color: rgb(191, 90, 242);
  color: rgb(191, 90, 242);
  font-weight: 400;
  width: 18rem;
  opacity: "40%";
`

export const InputBox = styled(Box)<{mode: string}>`
  width: 20rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  border: 2px solid ${(props) => (props.mode === 'dark' ? "rgb(255, 255, 255, 0.05);" : "rgb(0, 0, 0, 0.05)")};
  border-radius: 0.5rem;
  align-items: center;
  &:focus-within {
    border: 2px solid rgb(191, 90, 242);
  }
  position: relative;
`

const slide = {
  hidden: { height: 0, opacity: 0 },
  open: { height: "0rem", opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};

const MultipleDropdown: FC<Props> = ({ options, value, setValue, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value as string[]);
  const [filteredOptions, setFilteredOptions] = useState(options);
  

  const {mode} = useTheme();

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  return (
    <>
      <InputBox mode={mode}>
        <Box display="flex" flexDirection="row" flexWrap="wrap" width="64" alignItems="center">
        
          {inputValue?.map( item => (
            <Box 
              onClick={()=> {
              setInputValue(inputValue.filter((i) => i !== item))
              setValue(value.filter((i) => i !== item))
              }} 
              padding="0.5"
            >
              <Tag hover tone="accent" >
              <Box display="flex" alignItems="center" gap="1">
                {item}
                <IconClose size="4" />
              </Box>
            </Tag>
            </Box>
          ))}
          <Input
            ref={inputRef}
            placeholder={title}
            onClick={() => setIsExpanded(!isExpanded)}
            onChange={(e) => {
              setFilteredOptions(
                matchSorter(options, e.target.value, {
                  keys: ["name"],
                })
              );
            }}
          />
        </Box>
        <Box 
          display="flex" 
          flexDirection="row" 
          alignItems="center"
          style={{
            position: "absolute",
            right: "0.5rem",
          }}
        >
          {inputValue.length > 0 && 
          <Button shape="circle" size="small" variant="transparent" 
            onClick={()=> {
              setInputValue([]);
              setValue([]);
            }}>
            <IconClose size="4" color="textTertiary"/>
          </Button>
          }
          <Box
            transitionDuration="700"
            style={{
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
            onClick={() => {
              inputRef.current?.focus();
              setIsExpanded(!isExpanded);
            }}
          >
            <Button shape="circle" size="small" variant="transparent">
              <IconChevronRight color="textTertiary" size="5" />
            </Button>
          </Box>
        </Box>  
      </InputBox>
      <OptionsContainer isExpanded={isExpanded} >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="content"
              initial="hidden"
              animate="open"
              exit="collapsed"
              variants={slide}
              transition={{ duration: 0.3 }}
            >
              <ScrollContainer 
                backgroundColor={ mode === 'dark' ? "background" : "white" }
                mode={mode}
              >
                {filteredOptions.map((option) => (
                  <Option
                    key={option.id}
                    onClick={() => {

                      if (option.id === "") {
                        setValue([]);
                        return;
                      }
                      if (value.includes(option.id)) {
                        setValue(value.filter((i) => i !== option.id));
                      } else {
                        if (value.length) {
                          setValue([...value, option.id]);
                        } else {
                          setValue([option.id]);
                        }
                      }

                      if (option.name === "") {
                        setInputValue([]);
                        return;
                      }
                      if (inputValue.includes(option.name)) {
                        setInputValue(inputValue.filter((i) => i !== option.name));
                      } else {
                        if (inputValue.length) {
                          setInputValue([...inputValue, option.name]);
                        } else {
                          setInputValue([option.name]);
                        }
                      }
                      setIsExpanded(false);
                    }}
                    isSelected={inputValue.includes(option.name) ? true : false}
                  >
                    <Stack align="center">
                      <Text color={inputValue.includes(option.name) ? "purple" : "text" }>{option.name}</Text>
                    </Stack>
                  </Option>
                ))}
                {!filteredOptions.length && (
                  <Option>
                    <Stack align="center">
                      <Text variant="label">Not Found</Text>
                    </Stack>
                  </Option>
                )}
              </ScrollContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </OptionsContainer>
    </>
  );
};

export default MultipleDropdown;

export type { Props as DropdownProps };

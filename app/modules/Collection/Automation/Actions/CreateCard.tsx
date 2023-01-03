import Dropdown from "@/app/common/components/Dropdown";
import Modal from "@/app/common/components/Modal";
import PrimaryButton from "@/app/common/components/PrimaryButton";
import { useCircle } from "@/app/modules/Circle/CircleContext";
import { Action, CollectionType, Option, Property } from "@/app/types";
import { Box, Button, IconClose, Input, Stack, Tag, Text } from "degen";
import { SetStateAction, useEffect, useState } from "react";
import { useLocalCollection } from "../../Context/LocalCollectionContext";
import { Field } from "./Field";

type Props = {
  actionMode: "edit" | "create";
  action: Action;
  setAction: (action: Action) => void;
};

type Mapping = {
  from?: Option;
  to?: Option;
};

type Default = {
  field?: Option;
  value?: any;
};

type Value = {
  type: "mapping" | "default" | "responder";
  default?: Default;
  mapping?: Mapping;
};

type UsedProperty = {
  [propertyId: string]: boolean;
};

export default function CreateCard({ setAction, actionMode, action }: Props) {
  const [collectionOptions, setCollectionOptions] = useState<Option[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Option>(
    action?.data?.selectedCollection || ({} as Option)
  );
  const [fromPropertyOptions, setFromPropertyOptions] = useState<Option[]>([]);
  const [toPropertyOptions, setToPropertyOptions] = useState<Option[]>([]);
  const [selectedFromPropertyOptionType, setSelectedFromPropertyOptionType] =
    useState("");
  const [values, setValues] = useState<Value[]>(action?.data.values || []);
  const [fieldType, setFieldType] =
    useState<"mapping" | "default" | "responder">("default");
  const [usedProperty, setUsedProperty] = useState<UsedProperty>({});

  const { circle } = useCircle();
  const { localCollection: collection } = useLocalCollection();

  useEffect(() => {
    const fetchCollectionOptions = async () => {
      try {
        const data: CollectionType[] = await (
          await fetch(
            `${process.env.API_HOST}/circle/v1/${circle.id}/allActiveCollections`
          )
        ).json();
        setCollectionOptions(
          data
            .filter((collection) => collection.collectionType === 1)
            .map((collection) => ({
              label: collection.name,
              value: collection.id,
              data: collection,
            }))
        );
      } catch (e) {
        console.log(e);
      }
    };
    void fetchCollectionOptions();
    const milestoneFields = Object.entries(collection.properties).filter(
      ([propertyId, property]) => property.type === "milestone"
    );
    const notMilestoneFields = Object.entries(collection.properties).filter(
      ([propertyId, property]) => property.type !== "milestone"
    );
    let propOptions = notMilestoneFields.map(([propertyId, property]) => ({
      label: property.name,
      value: propertyId,
    })) as Option[];

    milestoneFields.forEach(([propertyId, property]) => {
      propOptions = [
        ...propOptions,
        {
          label: `${property.name}`,
          value: `${propertyId}`,
        },
        {
          label: `${property.name} title`,
          value: `${propertyId}.title`,
          data: {
            type: "shortText",
            fieldType: "milestone",
            fieldName: propertyId,
            subFieldName: "title",
          },
        },
        {
          label: `${property.name} description`,
          value: `${propertyId}.description`,
          data: {
            type: "longText",
            fieldType: "milestone",
            fieldName: propertyId,
            subFieldName: "description",
          },
        },
        {
          label: `${property.name} date`,
          value: `${propertyId}.date`,
          data: {
            type: "date",
            fieldType: "milestone",
            fieldName: propertyId,
            subFieldName: "dueDate",
          },
        },
        {
          label: `${property.name} reward`,
          value: `${propertyId}.reward`,
          data: {
            type: "reward",
            fieldType: "milestone",
            fieldName: propertyId,
            subFieldName: "reward",
          },
        },
      ];
    });
    setFromPropertyOptions(propOptions);
  }, []);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data: CollectionType = await (
          await fetch(
            `${process.env.API_HOST}/collection/v1/slug/${
              selectedCollection?.data?.slug as string
            }`,
            {
              credentials: "include",
            }
          )
        ).json();
        console.log({
          selectedFromPropertyOptionType,
          prop: data?.properties,
          fieldType,
        });
        if (data?.properties)
          if (fieldType === "mapping") {
            setToPropertyOptions(
              Object.entries(data?.properties)
                .filter(
                  ([propertyId, property]) =>
                    (property as Property).type ===
                      selectedFromPropertyOptionType &&
                    !usedProperty[propertyId]
                )
                .map(([propertyId, property]) => ({
                  label: (property as Property).name,
                  value: propertyId,
                  data: {
                    type: (property as Property).type,
                  },
                }))
            );
          } else if (fieldType === "default") {
            setToPropertyOptions(
              Object.entries(data?.properties)
                .filter(([propertyId, property]) => !usedProperty[propertyId])
                .map(([propertyId, property]) => ({
                  label: (property as Property).name,
                  value: propertyId,
                  data: {
                    type: (property as Property).type,
                  },
                }))
            );
          }
      } catch (e) {
        console.log(e);
      }
    };
    void fetchCollection();
  }, [selectedCollection, selectedFromPropertyOptionType, values]);

  return (
    <Box
      marginTop="2"
      marginBottom="4"
      onMouseLeave={() => {
        setAction({
          ...action,
          data: {
            selectedCollection,
            values,
          },
        });
      }}
      width="full"
    >
      <Box marginBottom="2">
        <Text variant="label">Pick Collection</Text>
      </Box>
      <Dropdown
        options={collectionOptions}
        selected={selectedCollection}
        onChange={(c: Option) => {
          setSelectedCollection(c);
          if (c.value === action?.data?.selectedCollection?.value) {
            setValues(action?.data.values);
          } else {
            setValues([]);
          }
        }}
        multiple={false}
      />
      {Object.keys(selectedCollection)?.length > 0 && (
        <Box width="full" marginTop="2">
          {values.map((value, index) => (
            <Box
              key={index}
              borderColor="foregroundSecondary"
              borderRadius="medium"
              borderWidth="0.375"
              padding="2"
              marginTop="1"
              marginBottom="1"
            >
              <Box
                display="flex"
                flexDirection="row"
                gap="2"
                width="full"
                alignItems="flex-end"
                justifyContent="flex-end"
                marginBottom="1"
              >
                <Button
                  shape="circle"
                  size="small"
                  variant="transparent"
                  onClick={() => {
                    const newValues = [...values];
                    newValues.splice(index, 1);
                    setValues(newValues);
                  }}
                >
                  <IconClose />
                </Button>
              </Box>
              {value.type === "responder" && (
                <Box
                  display="flex"
                  flexDirection="row"
                  gap="2"
                  width="full"
                  alignItems="center"
                  marginBottom="2"
                >
                  <Box width="1/4">
                    <Text variant="label">To Form Field</Text>
                  </Box>
                  <Dropdown
                    options={toPropertyOptions.filter((a) =>
                      ["user", "user[]", "ethAddress"].includes(a.data?.type)
                    )}
                    selected={value.mapping?.to}
                    onChange={(value) => {
                      const newValues = [...values];
                      newValues[index] = {
                        type: "responder",
                        mapping: {
                          to: value,
                        },
                      };
                      setValues(newValues);
                      console.log({ newValues });
                      console.log({ value });
                    }}
                    multiple={false}
                  />
                </Box>
              )}
              {value.type === "mapping" && (
                <>
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap="2"
                    width="full"
                    alignItems="center"
                    marginBottom="2"
                  >
                    <Box width="1/4">
                      <Text variant="label">From Form Field</Text>
                    </Box>
                    <Box width="3/4">
                      <Dropdown
                        options={fromPropertyOptions}
                        selected={value.mapping?.from}
                        onChange={(v) => {
                          const newValues = [...values];
                          if (v?.value !== value.mapping?.from?.value) {
                            newValues[index] = {
                              type: "mapping",
                              mapping: {
                                from: v,
                                to: {
                                  label: "",
                                  value: "",
                                },
                              },
                            };
                            setValues(newValues);
                            setSelectedFromPropertyOptionType(
                              v?.data?.type ||
                                collection.properties[v?.value]?.type
                            );
                          }
                        }}
                        multiple={false}
                        isClearable={false}
                      />
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap="2"
                    width="full"
                    alignItems="center"
                  >
                    <Box width="1/4">
                      <Text variant="label">To Collection Field</Text>
                    </Box>{" "}
                    <Box width="3/4">
                      <Dropdown
                        options={toPropertyOptions}
                        selected={value.mapping?.to}
                        onChange={(value) => {
                          const newValues = [...values];
                          newValues[index] = {
                            type: "mapping",
                            mapping: {
                              to: value,
                              from: newValues[index].mapping?.from,
                            },
                          };
                          setValues(newValues);
                        }}
                        multiple={false}
                        isClearable={false}
                      />
                    </Box>
                  </Box>
                </>
              )}
              {value.type === "default" && (
                <>
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap="2"
                    width="full"
                    alignItems="center"
                    marginBottom="2"
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap="2"
                      width="full"
                      alignItems="flex-start"
                      marginBottom="2"
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        gap="2"
                        width="full"
                        alignItems="center"
                        marginBottom="2"
                      >
                        <Box width="1/4">
                          <Text variant="label">Collection Field</Text>
                        </Box>

                        <Dropdown
                          options={toPropertyOptions}
                          selected={value.default?.field}
                          onChange={(v) => {
                            const newValues = [...values];
                            newValues[index] = {
                              type: "default",
                              default: {
                                field: v,
                              },
                            };
                            setValues(newValues);
                          }}
                          multiple={false}
                        />
                      </Box>
                      {value.default?.field?.value && (
                        <>
                          <Box width="full">
                            <Text variant="label">Value</Text>
                          </Box>

                          <Field
                            collection={
                              selectedCollection.data as CollectionType
                            }
                            propertyId={value.default?.field?.value}
                            type={
                              selectedCollection.data.properties[
                                value.default?.field?.value
                              ]?.type
                            }
                            data={value.default?.value}
                            setData={(v) => {
                              const newValues = [...values];
                              newValues[index] = {
                                type: "default",
                                default: {
                                  field: value.default?.field,
                                  value: v,
                                },
                              };
                              setValues(newValues);
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          ))}
          <Box
            width="full"
            marginTop="4"
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            gap="2"
          >
            <PrimaryButton
              variant="tertiary"
              onClick={() => {
                setFieldType("mapping");
                setValues([
                  ...values,
                  {
                    type: "mapping",
                    mapping: {
                      from: {
                        label: "",
                        value: "",
                      },
                      to: {
                        label: "",
                        value: "",
                      },
                    },
                  },
                ]);
              }}
            >
              + Mapping
            </PrimaryButton>
            <PrimaryButton
              variant="tertiary"
              onClick={() => {
                setFieldType("default");
                setValues([
                  ...values,
                  {
                    type: "default",
                    default: {
                      field: {
                        label: "",
                        value: "",
                      },
                      value: "",
                    },
                  },
                ]);
              }}
            >
              + Default Value
            </PrimaryButton>
            <PrimaryButton
              variant="tertiary"
              onClick={() => {
                setFieldType("responder");
                setValues([
                  ...values,
                  {
                    type: "responder",
                    mapping: {
                      to: {
                        label: "",
                        value: "",
                      },
                    },
                  },
                ]);
              }}
            >
              + Map Responder
            </PrimaryButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

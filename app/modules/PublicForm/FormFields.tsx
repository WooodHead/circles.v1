/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import PrimaryButton from "@/app/common/components/PrimaryButton";
import { isEmail } from "@/app/common/utils/utils";
import { useGlobal } from "@/app/context/globalContext";
import {
  addData,
  getForm,
  updateCollectionData,
} from "@/app/services/Collection";
import { FormType, KudosType, Registry, UserType } from "@/app/types";
import { Box, Stack, Text } from "degen";
import { isAddress } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import FormResponse from "./FormResponse";
import PublicField from "./PublicField";
import mixpanel from "@/app/common/utils/mixpanel";

type Props = {
  form: FormType;
  setForm: (form: FormType) => void;
};

const getUser = async () => {
  const res = await fetch(`${process.env.API_HOST}/user/me`, {
    credentials: "include",
  });
  return await res.json();
};

export default function FormFields({ form, setForm }: Props) {
  const [data, setData] = useState<any>({});
  const [memberOptions, setMemberOptions] = useState([]);
  const [updateResponse, setUpdateResponse] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitAnotherResponse, setSubmitAnotherResponse] = useState(false);
  const [kudos, setKudos] = useState({} as KudosType);
  const { connectedUser, connectUser } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(form.kudosClaimedByUser);
  const [submitting, setSubmitting] = useState(false);
  const { data: currentUser, refetch } = useQuery<UserType>(
    "getMyUser",
    getUser,
    {
      enabled: false,
    }
  );
  const [requiredFieldsNotSet, setRequiredFieldsNotSet] = useState(
    {} as { [key: string]: boolean }
  );
  const [fieldHasInvalidType, setFieldHasInvalidType] = useState(
    {} as { [key: string]: boolean }
  );

  const { refetch: fetchRegistry } = useQuery<Registry>(
    ["registry", form.parents[0].slug],
    () =>
      fetch(
        `${process.env.API_HOST}/circle/slug/${form.parents[0].slug}/getRegistry`
      ).then((res) => res.json()),
    {
      enabled: false,
    }
  );

  const checkRequired = (data: any) => {
    const requiredFieldsNotSet = {} as { [key: string]: boolean };
    form.propertyOrder.forEach((propertyId) => {
      const property = form.properties[propertyId];
      if (property.required && isEmpty(propertyId, data[propertyId])) {
        requiredFieldsNotSet[propertyId] = true;
      }
    });
    setRequiredFieldsNotSet(requiredFieldsNotSet);
    return Object.keys(requiredFieldsNotSet).length === 0;
  };

  const checkValue = (data: any) => {
    const fieldHasInvalidType = {} as { [key: string]: boolean };
    form.propertyOrder.forEach((propertyId) => {
      if (isIncorrectType(propertyId, data[propertyId])) {
        fieldHasInvalidType[propertyId] = true;
      }
    });
    setFieldHasInvalidType(fieldHasInvalidType);
    return Object.keys(fieldHasInvalidType).length === 0;
  };

  useEffect(() => {
    void fetchRegistry();
    // setClaimed(form.kudosClaimedByUser);
    setSubmitted(form.previousResponses?.length > 0);

    if (form.mintkudosTokenId) {
      void (async () => {
        const kudo = await (
          await fetch(
            `${process.env.MINTKUDOS_HOST}/v1/tokens/${form.mintkudosTokenId}`
          )
        ).json();
        setKudos(kudo);
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (form?.parents) {
      void (async () => {
        const res = await (
          await fetch(
            `${process.env.API_HOST}/circle/${form.parents[0].id}/memberDetails?circleIds=${form.parents[0].id}`
          )
        ).json();
        const memberOptions = res.members?.map((member: string) => ({
          label: res.memberDetails && res.memberDetails[member]?.username,
          value: member,
        }));
        setMemberOptions(memberOptions);
      })();
    }
  }, [form]);

  useEffect(() => {
    if (form) {
      setLoading(true);
      const tempData: any = {};

      if (updateResponse && form?.previousResponses?.length > 0) {
        const lastResponse =
          form.previousResponses[form.previousResponses.length - 1];
        form.propertyOrder.forEach((propertyId) => {
          if (
            [
              "longText",
              "shortText",
              "ethAddress",
              "user",
              "date",
              "number",
              "email",
            ].includes(form.properties[propertyId].type)
          ) {
            tempData[propertyId] = lastResponse[propertyId] || "";
          } else if (form.properties[propertyId].type === "singleSelect") {
            tempData[propertyId] =
              lastResponse[propertyId] ||
              // @ts-ignore
              {};
          } else if (
            ["multiSelect", "user[]", "milestone"].includes(
              form.properties[propertyId].type
            )
          ) {
            tempData[propertyId] = lastResponse[propertyId] || [];
          } else if (["reward"].includes(form.properties[propertyId].type)) {
            tempData[propertyId] = lastResponse[propertyId];
          }
        });
      } else {
        const tempData: any = {};
        form.propertyOrder.forEach((propertyId) => {
          if (
            [
              "longText",
              "shortText",
              "ethAddress",
              "user",
              "date",
              "number",
            ].includes(form.properties[propertyId].type)
          ) {
            tempData[propertyId] = "";
          } else if (form.properties[propertyId].type === "singleSelect") {
            // @ts-ignore
            tempData[propertyId] = {};
          } else if (
            ["multiSelect", "user[]"].includes(form.properties[propertyId].type)
          ) {
            tempData[propertyId] = [];
          }
        });
      }
      setData(tempData);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [form, updateResponse]);

  useEffect(() => {
    if (!connectedUser && currentUser?.id) connectUser(currentUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, connectedUser]);

  useEffect(() => {
    refetch()
      .then((res) => {
        const data = res.data;
        if (data?.id) connectUser(data.id);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Could not fetch user data");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    let res;
    if (!checkRequired(data)) return;
    if (!checkValue(data)) return;
    setSubmitting(true);
    if (updateResponse) {
      const lastResponse =
        form.previousResponses[form.previousResponses.length - 1];
      res = await updateCollectionData(form.id || "", lastResponse.slug, data);
    } else {
      res = await addData(form.id || "", data);
    }
    const resAfterSave = await getForm(form.slug);
    if (res.id) {
      toast.success("Form submitted successfully");
      setForm(resAfterSave);
      setSubmitted(true);
      setSubmitAnotherResponse(false);
      setUpdateResponse(false);
    } else {
      toast.error("Error adding data");
    }
    process.env.NODE_ENV === "production" &&
      mixpanel.track("Form Submit", {
        formId: form.slug,
        sybilEnabled: form.sybilProtectionEnabled,
        user: connectedUser,
      });
    setSubmitting(false);
  };

  if (submitted && !submitAnotherResponse && !updateResponse) {
    return (
      <FormResponse
        form={form}
        setSubmitAnotherResponse={setSubmitAnotherResponse}
        setUpdateResponse={setUpdateResponse}
        setSubmitted={setSubmitted}
        kudos={kudos}
        claimed={claimed}
        setClaimed={setClaimed}
      />
    );
  }

  const isIncorrectType = (propertyName: string, value: any) => {
    switch (form.properties[propertyName].type) {
      case "ethAddress":
        return value && !isAddress(value);

      case "email":
        return value && !isEmail(value);

      default:
        return false;
    }
  };

  const isEmpty = (propertyName: string, value: any) => {
    switch (form.properties[propertyName].type) {
      case "longText":
      case "shortText":
      case "ethAddress":
      case "user":
      case "date":
      case "email":
        return !value;
      case "singleSelect":
        return !value || !value.value || !value.label;
      case "multiSelect":
      case "milestone":
      case "user[]":
        return !value || value.length === 0;
      case "reward":
        return !value?.value;
      default:
        return false;
    }
  };

  const updateRequiredFieldNotSet = (propertyName: string, value: any) => {
    if (!isEmpty(propertyName, value)) {
      setRequiredFieldsNotSet((prev) => {
        const temp = { ...prev };
        delete temp[propertyName];
        return temp;
      });
    }
  };

  const updateFieldHasInvalidType = (propertyName: string, value: any) => {
    if (!isIncorrectType(propertyName, value)) {
      setFieldHasInvalidType((prev) => {
        const temp = { ...prev };
        delete temp[propertyName];
        return temp;
      });
    }
  };

  return (
    <Container borderRadius="2xLarge">
      {!loading &&
        form.propertyOrder.map((propertyName) => {
          if (form.properties[propertyName].isPartOfFormView)
            return (
              <PublicField
                form={form}
                propertyName={propertyName}
                data={data}
                setData={setData}
                memberOptions={memberOptions}
                requiredFieldsNotSet={requiredFieldsNotSet}
                key={propertyName}
                updateRequiredFieldNotSet={updateRequiredFieldNotSet}
                fieldHasInvalidType={fieldHasInvalidType}
                updateFieldHasInvalidType={updateFieldHasInvalidType}
              />
            );
        })}
      <Box marginBottom="24">
        <Stack
          direction={{
            xs: "vertical",
            md: "horizontal",
          }}
        >
          <Box width="full" paddingX="5">
            {Object.keys(requiredFieldsNotSet).length > 0 && (
              <Text color="red" variant="small">
                {" "}
                {`Required fields are empty: ${Object.keys(
                  requiredFieldsNotSet
                ).join(",")}`}{" "}
              </Text>
            )}

            <PrimaryButton onClick={onSubmit} loading={submitting}>
              Submit
            </PrimaryButton>
          </Box>
          {(submitAnotherResponse || updateResponse) && (
            <Box width="full" paddingX="5">
              <PrimaryButton
                variant="tertiary"
                onClick={() => {
                  setSubmitAnotherResponse(false);
                  setUpdateResponse(false);
                  setSubmitted(true);
                }}
              >
                Nevermind
              </PrimaryButton>
            </Box>
          )}
        </Stack>
      </Box>
    </Container>
  );
}

const Container = styled(Box)`
  @media (max-width: 768px) {
    padding: 0rem;
    margin-right: 0rem;
    margin-bottom: 0.5rem;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    padding: 2rem;
    margin-right: 4rem;
  }

  @media (min-width: 1024px) and (max-width: 1280px) {
    padding: 2rem;
    margin-right: 4rem;
  }
  padding: 2rem;
  margin-right: 4rem;
`;

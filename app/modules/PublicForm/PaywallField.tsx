import PrimaryButton from "@/app/common/components/PrimaryButton";
import { PayWallOptions, Registry } from "@/app/types";
import { Box, Input, Stack, Text } from "degen";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import usePaymentGateway from "@/app/services/Payment/usePayment";
import { useQuery } from "react-query";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import useERC20 from "@/app/services/Payment/useERC20";
import Dropdown, { OptionType } from "@/app/common/components/Dropdown";
import { useRouter } from "next/router";
import { useCircle } from "../Circle/CircleContext";

type Props = {
  form: any;
  propertyName: string;
  data: any;
  disabled?: boolean;
  setData: (data: any) => void;
};

const PaywallField = ({
  form,
  propertyName,
  data,
  disabled,
  setData,
}: Props) => {
  const router = useRouter();
  const { circle: cId } = router.query;

  const payWallNetwork = (form.properties[propertyName]?.payWallOptions
    .network || {}) as Registry;

  const payWallOptions = form.properties[propertyName]
    ?.payWallOptions as PayWallOptions;

  const payWallData = data[propertyName];

  const { data: circleRegistry, refetch } = useQuery<Registry>(
    ["registry", form.parents?.[0].slug],
    () =>
      fetch(
        `${process.env.API_HOST}/circle/slug/${
          cId ? cId : form.parents?.[0].slug
        }/getRegistry`
      ).then((res) => res.json()),
    {
      enabled: false,
    }
  );

  const { batchPay } = usePaymentGateway();
  const { approve, isApproved, hasBalance } = useERC20();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { address: userAddress } = useAccount();

  const [tokenOptions, setTokenOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const firstChainName =
    Object.values(payWallNetwork).length > 0
      ? Object.values(payWallNetwork)[0].name
      : "";
  const firstChainId =
    Object.keys(payWallNetwork).length > 0
      ? Object.keys(payWallNetwork)[0]
      : "";
  const firstTokenSymbol = Object.values(
    payWallNetwork[firstChainId]?.tokenDetails
  )[0].symbol;
  const firstTokenAddress = Object.keys(
    payWallNetwork[firstChainId]?.tokenDetails
  )[0];
  const [selectedChain, setSelectedChain] = useState<OptionType>({
    label:
      (payWallData && payWallData?.[payWallData?.length - 1]?.chain?.label) ||
      firstChainName,
    value:
      (payWallData && payWallData?.[payWallData?.length - 1]?.chain?.value) ||
      firstChainId,
  });
  const [selectedToken, setSelectedToken] = useState<OptionType>({
    label: firstTokenSymbol,
    value: firstTokenAddress,
  });
  const [payValue, setPayValue] = useState(
    payWallData?.[payWallData?.length - 1]?.value || 0
  );

  // Setting Token Options as per the network
  useEffect(() => {
    if (payWallOptions && selectedChain) {
      const tokens = Object.entries(
        payWallOptions?.network?.[cId ? firstChainId : selectedChain.value]
          ?.tokenDetails
      ).map(([address, token]) => {
        return {
          label: token.symbol,
          value: address,
        };
      });
      if (
        selectedChain.label ==
        payWallData?.[payWallData.length - 1]?.chain.label
      ) {
        setSelectedToken({
          label: payWallData?.[payWallData.length - 1]?.token.label,
          value: payWallData?.[payWallData.length - 1]?.token.value,
        });
      } else {
        setSelectedToken(tokens[0]);
      }
      setTokenOptions(tokens);
    }
  }, [selectedChain]);

  const approval = async () => {
    setLoading(true);
    const approvalStatus = await toast
      .promise(
        isApproved(
          selectedToken.value,
          circleRegistry?.[selectedChain.value].distributorAddress as string,
          payWallOptions.value > 0 ? payWallOptions.value : payValue,
          userAddress || "",
          circleRegistry?.[selectedChain.value].provider || ""
        ),
        {
          pending: "Checking token approval",
          error: "Ouch ! Something went wrong",
        },
        {
          position: "top-center",
        }
      )
      .catch((err) => console.log(err));
    console.log({ approvalStatus });

    setLoading(false);
    return approvalStatus;
  };

  // Record payment
  const recordPayment = (txnHash: string) => {
    const data = {
      chain: selectedChain,
      token: selectedToken,
      value: payWallOptions.value > 0 ? payWallOptions?.value : payValue,
      paid: true,
      txnHash,
    };
    if (txnHash) setData(payWallData ? [...payWallData, data] : [data]);
  };

  const checkNetwork = async () => {
    if (!(chain?.id.toString() == selectedChain.value)) {
      try {
        switchNetworkAsync &&
          (await switchNetworkAsync(parseInt(selectedChain.value)).catch(
            (err: any) => {
              console.log(err.message);
            }
          ));
      } catch (err: any) {
        console.log(err.message);
        toast.error(err.message);
      }
    }
  };

  const checkBalance = async () => {
    setLoading(true);
    const balance = await toast
      .promise(
        hasBalance(
          selectedToken.value,
          payWallOptions.value > 0 ? payWallOptions.value : payValue,
          userAddress as string,
          circleRegistry?.[selectedChain.value].provider || ""
        ),
        {
          pending: "Checking Balance",
          error: "Something went wrong",
        },
        {
          position: "top-center",
        }
      )
      .catch((err) => console.log(err));

    if (!balance) {
      toast.error(`You don't have sufficient ` + `${selectedToken.label}`);
      setLoading(false);
      return false;
    }
    setLoading(false);
    return true;
  };

  const currencyPayment = async () => {
    // Check if wallet has enough tokens
    const hasSufficientBalance = await checkBalance();
    if (!hasSufficientBalance) return;

    setLoading(true);
    const options = {
      chainId: selectedChain.value || "",
      paymentType: "currency",
      userAddresses: [form.properties[propertyName]?.payWallOptions.receiver],
      amounts: [payWallOptions.value > 0 ? payWallOptions.value : payValue],
      tokenAddresses: [""],
      batchPayType: "form",
      cardIds: [""],
      circleId: form.parents?.[0].id,
      circleRegistry: circleRegistry,
    };
    const currencyTxnHash = await toast
      .promise(
        batchPay(options),
        {
          pending: `Paying ${
            (circleRegistry &&
              circleRegistry[selectedChain.value]?.nativeCurrency) ||
            "Network Gas Token"
          }`,
          error: {
            render: ({ data }) => data,
          },
        },
        {
          position: "top-center",
        }
      )
      .catch((err) => console.log(err));

    recordPayment(currencyTxnHash);
    setLoading(false);
    return;
  };

  const tokenPayment = async () => {
    setLoading(true);
    // Paying on Mumbai or Polygon Mainnet --> Gasless transactions via BICO
    // if (
    //   circleRegistry &&
    //   (selectedChain.value === "137" || selectedChain.value === "80001")
    // ) {
    //   setLoading(true);
    //   await payGasless({
    //     chainId: selectedChain.value || "",
    //     paymentType: "tokens",
    //     batchPayType: "form",
    //     userAddresses: [payWallOptions.receiver],
    //     amounts: [payWallOptions.value > 0 ? payWallOptions.value : payValue],
    //     tokenAddresses: [selectedToken.value],
    //     cardIds: [""],
    //     circleId: form.parents?.[0].id,
    //     circleRegistry: circleRegistry,
    //   });
    //   recordPayment("gasless");
    //   setLoading(false);
    //   return;
    // }

    // Paying on all other networks
    const options = {
      chainId: selectedChain.value || "",
      paymentType: "tokens",
      batchPayType: "form",
      userAddresses: [payWallOptions.receiver],
      amounts: [payWallOptions.value > 0 ? payWallOptions.value : payValue],
      tokenAddresses: [selectedToken.value],
      cardIds: [""],
      circleId: form.parents?.[0].id,
      circleRegistry: circleRegistry,
    };
    setLoading(true);
    const tokenTxnHash = await toast
      .promise(
        batchPay(options),
        {
          pending: `Sending ${selectedToken.label}`,
          error: {
            render: ({ data }) => {
              return "Cannot proceed with the transaction, check if you have enough balance";
            },
          },
        },
        {
          position: "top-center",
        }
      )
      .catch((err) => console.log(err));
    recordPayment(tokenTxnHash);
    setLoading(false);
  };

  useEffect(() => {
    void refetch();
  }, [selectedToken]);

  return (
    <Box display={"flex"} flexDirection="column" gap={"2"}>
      {data[propertyName] ? (
        <Stack space="4" direction="horizontal" align="center">
          <a
            href={`${circleRegistry?.[selectedChain.value].blockExplorer}tx/${
              data[propertyName][0].txnHash
            }`}
            target="_blank"
            rel="noreferrer"
          >
            <Text underline>View Transaction</Text>
          </a>
        </Stack>
      ) : (
        <Stack
          direction={{
            xs: "vertical",
            md: "horizontal",
          }}
          align="center"
        >
          <Box
            width={{
              xs: "full",
              md: "72",
            }}
            marginTop="2"
          >
            <Dropdown
              options={
                payWallOptions.network
                  ? Object.entries(payWallOptions.network).map(
                      ([chainId, network]) => {
                        return {
                          label: network.name,
                          value: chainId,
                        };
                      }
                    )
                  : []
              }
              selected={selectedChain}
              onChange={(option) => {
                setSelectedChain(option);
              }}
              multiple={false}
              isClearable={false}
              disabled={true}
              portal={false}
            />
          </Box>
          <Box
            width={{
              xs: "full",
              md: "72",
            }}
            marginTop="2"
          >
            <Dropdown
              options={tokenOptions}
              selected={selectedToken}
              onChange={(option) => {
                setSelectedToken(option);
              }}
              multiple={false}
              isClearable={false}
              disabled={true}
              portal={false}
            />
          </Box>
          <Box
            width={{
              xs: "full",
              md: "72",
            }}
            marginTop="2"
          >
            <Input
              label=""
              placeholder={`Enter Reward Amount`}
              value={
                payWallOptions.value > 0 ? payWallOptions?.value : payValue
              }
              onChange={(e) => {
                setPayValue(parseFloat(e.target.value));
              }}
              type="number"
              units={selectedToken.label}
              min={0}
              disabled={!!payWallOptions.value || disabled}
            />
          </Box>
        </Stack>
      )}
      {!cId && !data[propertyName] && (
        <Box display="flex" flexDirection="row" width="full">
          <Box
            width={{
              xs: "full",
              md: "64",
            }}
          >
            {chain?.id.toString() == selectedChain.value ? (
              <PrimaryButton
                loading={loading}
                onClick={async () => {
                  // Checks if you are on the right network
                  await checkNetwork();

                  // Paying via Native Currency
                  if (
                    circleRegistry &&
                    selectedToken.label ==
                      circleRegistry[selectedChain.value]?.nativeCurrency
                  ) {
                    await currencyPayment();
                  }

                  // Paying via ERC20 Token
                  if (
                    circleRegistry &&
                    selectedToken.label !==
                      circleRegistry[selectedChain.value]?.nativeCurrency
                  ) {
                    // Check if you have sufficient ERC20 Allowance
                    const approvalStatus = await approval();

                    // Approval for ERC20 token
                    setLoading(true);
                    if (!approvalStatus) {
                      await toast.promise(
                        approve(
                          selectedChain.value,
                          selectedToken.value,
                          circleRegistry
                        ).then((res: any) => {
                          if (res) {
                            const pay = async () => {
                              await tokenPayment();
                            };
                            pay();
                          }
                        }),
                        {
                          pending: `Approving ${selectedToken.label} Token`,
                          error: {
                            render: ({ data }) => data,
                          },
                        },
                        {
                          position: "top-center",
                        }
                      );
                    } else {
                      await tokenPayment();
                    }

                    setLoading(false);
                  }
                }}
                disabled={disabled || (payWallOptions.value < 0 && !payValue)}
              >
                Pay {payWallOptions.value > 0 ? payWallOptions.value : payValue}
                {" " + selectedToken.label}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={async () => {
                  // Switches to the right network
                  await checkNetwork();
                }}
              >
                Switch Network To Pay
              </PrimaryButton>
            )}
          </Box>
        </Box>
      )}
      {cId && (
        <Input
          label=""
          placeholder={`Enter Transaction Hash`}
          onChange={(e) => {
            setData({
              chain: selectedChain,
              token: selectedToken,
              value:
                payWallOptions.value > 0 ? payWallOptions?.value : payValue,
              paid: true,
              txnHash: e.target.value,
            });
          }}
          type="text"
        />
      )}
    </Box>
  );
};

export default PaywallField;

import { kudosTokenTypes, kudosTypes } from "@/app/common/utils/constants";
import { useCircle } from "@/app/modules/Circle/CircleContext";
import { KudosRequestType, KudosType, UserType } from "@/app/types";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useNetwork } from "wagmi";
import React, { useEffect, useState } from "react";
import { useLocalCard } from "@/app/modules/Project/CreateCardModal/hooks/LocalCardContext";
import { useQuery } from "react-query";

export default function useCredentials() {
  const { registry, circle } = useCircle();
  const { activeChain, switchNetworkAsync } = useNetwork();
  const { kudosMinted, setKudosMinted, cardId, assignees, reviewers, setCard } =
    useLocalCard();

  const mintKudos = async (kudos: KudosRequestType) => {
    const value = {
      ...kudos,
      headline: kudos.headline,
      description: kudos.description?.substring(1, 1000) || "",
      communityUniqId: "c6c9a5ff-9d3c-4858-ade1-354e1ecd0cb0",
      startDateTimestamp: kudos.startDateTimestamp || 0,
      endDateTimestamp: kudos.endDateTimestamp || 0,
      expirationTimestamp: kudos.expirationTimestamp || 0,
      isSignatureRequired: true,
      isAllowlistRequired: true,
      links: kudos.links || [],
      totalClaimCount: 0,
    };
    const chainId = "80001";
    const domainInfo = {
      name: "Kudos",
      version: "7",

      // Mumbai
      chainId,
      verifyingContract: "0xB876baF8F69cD35fb96A17a599b070FBdD18A6a1",
    };

    if (registry) {
      try {
        if (activeChain?.id.toString() !== chainId) {
          switchNetworkAsync && (await switchNetworkAsync(parseInt(chainId)));
        }
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        const signer = provider.getSigner();
        console.log(value);
        // Obtain signature
        const signature: string = await signer._signTypedData(
          domainInfo,
          kudosTypes,
          value
        );
        const body = JSON.stringify({
          creator: kudos.creator,
          headline: value.headline,
          description: value.description,
          startDateTimestamp: value.startDateTimestamp,
          endDateTimestamp: value.endDateTimestamp,
          expirationTimestamp: value.expirationTimestamp,
          links: value.links,
          isSignatureRequired: value.isSignatureRequired,
          isAllowlistRequired: value.isAllowlistRequired,
          communityId: "c6c9a5ff-9d3c-4858-ade1-354e1ecd0cb0",
          nftTypeId: "defaultOrangeRed",
          contributors: kudos.contributors,
          signature: signature,
        });
        toast("Minting Kudos...", {
          theme: "dark",
        });
        const res = await fetch(
          `http://localhost:8080/card/v1/${circle?.id}/mintKudos`,
          {
            credentials: "include",
            method: "PATCH",
            body,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          console.log(data);

          return data;
        } else {
          toast("Error creating retro", {
            theme: "dark",
          });
          return false;
        }
      } catch (error: any) {
        toast.error(error.message);
        console.log(error);
        return;
      }
    }

    return null;
  };

  const recordTokenId = (operationId: string, kudosFor?: string) => {
    let time = 1000;
    const intervalPromise = setInterval(() => {
      time += 1000;
      console.log(time);
      fetch(`https://sandbox-api.mintkudos.xyz${operationId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            console.log(data);

            if (data.status === "success") {
              clearInterval(intervalPromise);
              const kudosForUsers = kudosFor || "assignee";
              fetch(`http://localhost:8080/card/v1/${cardId}/recordKudos`, {
                method: "PATCH",
                body: JSON.stringify({
                  for: kudosForUsers,
                  tokenId: data.resourceId,
                  contributors:
                    kudosForUsers === "assignee" ? assignees : reviewers,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              })
                .then((res) => {
                  if (res.ok) {
                    res
                      .json()
                      .then((res2) => setCard(res2))
                      .catch((err) => console.log(err));
                  }
                })
                .catch((err) => console.log(err));
            }
          }
        })
        .catch((err) => console.log(err));
    }, 1000);
    setTimeout(() => {
      clearInterval(intervalPromise);
    }, 120000);
  };

  const viewKudos = async (): Promise<KudosType[]> => {
    const kudos = [];
    console.log("view");
    for (const [role, tokenId] of Object.entries(kudosMinted)) {
      console.log(kudosMinted);
      const res = await fetch(
        `https://sandbox-api.mintkudos.xyz/v1/tokens/${tokenId}`
      );
      if (res.ok) {
        kudos.push(await res.json());
      }
    }
    return kudos;
  };

  const claimKudos = async (tokenId: number, claimingAddress: string) => {
    const value = {
      tokenId: tokenId, // mandatory
    };
    const chainId = "80001";
    const domainInfo = {
      name: "Kudos",
      version: "7",

      // Mumbai
      chainId,
      verifyingContract: "0xB876baF8F69cD35fb96A17a599b070FBdD18A6a1",
    };
    if (registry) {
      try {
        if (activeChain?.id.toString() !== chainId) {
          switchNetworkAsync && (await switchNetworkAsync(parseInt(chainId)));
        }
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        const signer = provider.getSigner();
        console.log(value);
        // Obtain signature
        const signature: string = await signer._signTypedData(
          domainInfo,
          kudosTokenTypes,
          value
        );

        toast("Claiming Kudos...", {
          theme: "dark",
        });
        const res = await fetch(
          `http://localhost:8080/card/v1/${circle?.id}/claimKudos`,
          {
            credentials: "include",
            method: "PATCH",
            body: JSON.stringify({
              claimingAddress: claimingAddress,
              signature: signature,
              tokenId: tokenId,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          console.log(data);

          return data;
        }
      } catch (error: any) {
        toast.error(error.message);
        console.log(error);
        return;
      }
    }
  };

  const recordClaimInfo = (operationId: string, kudosFor?: string) => {
    let time = 1000;
    const intervalPromise = setInterval(() => {
      time += 1000;
      console.log(time);
      fetch(`https://sandbox-api.mintkudos.xyz${operationId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            console.log(data);

            if (data.status === "success") {
              clearInterval(intervalPromise);
              console.log(cardId);
              console.log(data.resourceId);

              fetch(`http://localhost:8080/card/v1/${cardId}/recordClaimInfo`, {
                method: "PATCH",
                body: JSON.stringify({
                  for: kudosFor || "assignee",
                  tokenId: data.resourceId,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              })
                .then((res) => {
                  if (res.ok)
                    setKudosMinted({
                      ...kudosMinted,
                      [kudosFor || "assignee"]: data.resourceId,
                    });
                })
                .catch((err) => console.log(err));
            }
          }
        })
        .catch((err) => console.log(err));
    }, 1000);
    setTimeout(() => {
      clearInterval(intervalPromise);
    }, 20000);
  };

  const getKudosOfUser = async (ethAddress: string) => {
    const res = await fetch(
      `https://sandbox-api.mintkudos.xyz/v1/wallets/${ethAddress}/tokens`
    );
    if (res.ok) {
      return await res.json();
    } else {
      toast.error("Something went wrong while fetching your kudos");
      console.log(res);
      return [];
    }
  };

  return {
    mintKudos,
    recordTokenId,
    claimKudos,
    viewKudos,
    recordClaimInfo,
    getKudosOfUser,
  };
}

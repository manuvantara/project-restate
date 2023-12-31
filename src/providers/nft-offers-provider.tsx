'use client';

import type { NFTOffer } from 'xrpl';

import { useAccountNfts } from '@/hooks/use-account-nfts';
import { useIsConnected } from '@/hooks/use-is-connected';
import { useXRPLClient } from '@/hooks/use-xrpl-client';
import { createContext, useEffect, useState } from 'react';

type NftOffersContextType = {
  isOwner: boolean;
  nftId: string;
  refetchSellOffers: () => void;
  sellOffers: NFTOffer[];
};

export const NftOffersContext = createContext<NftOffersContextType | undefined>(
  undefined,
);

export function NftOffersProvider({
  children,
  nftId,
}: {
  children: React.ReactNode;
  nftId: string;
}) {
  const [sellOffers, setSellOffers] = useState<NFTOffer[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [offersRefetchTrigger, setOffersRefetchTrigger] = useState(0);

  const { client } = useXRPLClient();
  const isConnected = useIsConnected();

  const { nfts, refetchNftsTrigger } = useAccountNfts();

  function refetchSellOffers() {
    setOffersRefetchTrigger((prev) => prev + 1);
  }

  // offers
  useEffect(() => {
    async function fetchNftSellOffers() {
      try {
        const response = await client.request({
          command: 'nft_sell_offers',
          nft_id: nftId!,
        });
        //console.log(response);
        setSellOffers(response.result.offers);
      } catch (error) {
        setSellOffers([]);
        //console.error(error);
      }
    }

    if (client && isConnected && nftId) {
      fetchNftSellOffers();
    }
  }, [client, nftId, offersRefetchTrigger, isConnected]);

  // owner
  useEffect(() => {
    if (nftId && nfts.length) {
      setIsOwner(nfts.map((nft) => nft.NFTokenID).includes(nftId));
    }
  }, [nftId, nfts, refetchNftsTrigger]);

  return (
    <NftOffersContext.Provider
      value={{
        isOwner,
        nftId,
        refetchSellOffers,
        sellOffers,
      }}
    >
      {children}
    </NftOffersContext.Provider>
  );
}

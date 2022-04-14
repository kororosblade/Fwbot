import { Box, Flex, Grid, GridItem, useMediaQuery } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { assetMap, filterMbsByType, itemsClaimRequiredMap, mbsMultiMap } from "../store/data";
import { RootState } from "../store/store";
import { isTool } from "../types/data.typeguards";
import { AnimalsResponse, CropsResponse, MbsResponse, ToolsResponse } from "../types/data.types";
import { adjustTime, msToTime } from "../utils/timers";
import { getTextColor } from "../utils/utils";

const ItemList = () => {
  const [breakPoint480] = useMediaQuery("(min-width: 480px)");
  const { items } = useSelector((state: RootState) => state.user);

  function sortList(list: ToolsResponse[]) {
    const array = [...list];
    const sorted = array.sort((a, b) => {
      if (a.type > b.type) return 1;
      if (b.type > a.type) return -1;
      return 0;
    });
    return sorted;
  }

  function renderAsset(
    responseItem: ToolsResponse | MbsResponse | CropsResponse | AnimalsResponse,
    template_id: string,
    key: number,
    mbs: MbsResponse[]
  ) {
    const tool = assetMap.get(template_id);
    if (!tool) return;
    const { name, type } = tool;
    const color = getTextColor(type);
    const timer = adjustTime(responseItem, mbs);
    // IF item is not Tool, return without store count
    if (!isTool(responseItem)) {
      return (
        <GridItem key={key} display="flex" alignItems="center" justifyContent="space-between" w="100%">
          <Box overflow="hidden" isTruncated color={color} w="100%">
            {name}
          </Box>
          <Flex justifyContent="center" w="50%" fontSize="14px" color={timer < 0 ? "tomato" : "whiteAlpha.900"}>
            {msToTime(timer)}
          </Flex>
          {"times_claimed" in responseItem ? (
            <Flex justifyContent="center" w="50%" fontSize="14px">{`${
              responseItem.times_claimed
            }/${itemsClaimRequiredMap.get(responseItem.template_id.toString())}`}</Flex>
          ) : (
            <Flex justifyContent="center" w="50%" fontSize="14px"></Flex>
          )}
        </GridItem>
      );
    }

    // count store/max store
    const exception = ["Ancient Stone Axe", "Mining Excavator"];
    const hour = exception.includes(name) ? 7200000 : 3600000;
    const filteredMbs = filterMbsByType(mbs, responseItem.type);
    const canBeStored = filteredMbs.reduce((acc, cur) => (acc += mbsMultiMap.get(cur.template_id.toString())!), 0) + 1;
    const currentlyStored = canBeStored - Math.ceil(timer / hour);
    return (
      <GridItem key={key} display="flex" alignItems="center" justifyContent="space-between" w="100%">
        <Box overflow="hidden" isTruncated color={color} w="100%">
          {name}
        </Box>
        <Flex justifyContent="center" w="50%" fontSize="14px" color={timer < 0 ? "tomato" : "whiteAlpha.900"}>
          {msToTime(timer)}
        </Flex>
        <Flex justifyContent="center" w="50%" fontSize="14px">{`${currentlyStored}/${canBeStored}`}</Flex>
      </GridItem>
    );
  }

  return (
    <Grid
      width={breakPoint480 ? "unset" : "100%"}
      backgroundColor="whiteAlpha.100"
      alignContent="flex-start"
      borderRadius="md"
      padding="3"
      boxShadow="md"
      overflowX="auto"
      w="100%"
      maxWidth="400px"
    >
      <GridItem display="flex" alignItems="center" justifyContent="space-between" w="100%" textAlign={"center"}>
        <Flex w="100%" justifyContent="center">
          Asset name
        </Flex>
        <Flex justifyContent="center" textAlign="center" w="50%">
          Timer
        </Flex>
        <Flex justifyContent="center" textAlign="center" w="50%">
          Stored
        </Flex>
      </GridItem>
      <Grid
        gap="1px"
        maxHeight="300px"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "3px",
            borderRadius: "8px",
            backgroundColor: `whiteAlpha.100`,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `whiteAlpha.300`,
          },
        }}
      >
        {items.toolsList &&
          sortList(items.toolsList).map((tool, index) =>
            renderAsset(tool, tool.template_id.toString(), index, items.mbsList)
          )}
        {items.animalsList.map((animal, index) =>
          renderAsset(animal, animal.template_id.toString(), index, items.mbsList)
        )}
        {items.cropsList.map((crop, index) => renderAsset(crop, crop.template_id.toString(), index, items.mbsList))}
        {items.mbsList &&
          items.mbsList.map((mbs, index) => renderAsset(mbs, mbs.template_id.toString(), index, items.mbsList))}
      </Grid>
    </Grid>
  );
};

export default ItemList;

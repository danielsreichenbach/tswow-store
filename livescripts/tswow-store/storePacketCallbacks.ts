
import { ClientCallbackOperations } from "../../shared/Messages";
import { BuyItemPayload } from "../../shared/Payloads/BuyItemPayload";
import { DonationPointsPayload } from "../../shared/Payloads/DonationPointsPayload";
import { StoreItem, StoreItemPayload } from "../../shared/Payloads/StoreItemPayload";
import { setupItems } from "./retrieveItems";

export let accountPoints: TSDictionary<uint32, number> = CreateDictionary<uint32, number>({});
export let itemDict: TSDictionary<uint32, TSDictionary<uint32, StoreItem>> = CreateDictionary<uint32, TSDictionary<uint32, StoreItem>>({});
let storePayload: StoreItemPayload;
export function StorePacketCallbacks(events: TSEvents) {
    storePayload = setupItems(itemDict);
    if (!storePayload || !storePayload.AllItems.length) {
        return;
    }

    events.Player.OnLogin((player, firstLogin) => {
        LoadAccountToCache(player.GetAccountID(), true);
        sendPoints(player);

        const extraIDQuery = QueryWorld("SELECT DISTINCT extra_id FROM store_items");
        const extraIDs: number[] = [];
        while (extraIDQuery.GetRow()) {
            extraIDs.push(extraIDQuery.GetUInt64(0));
        }

        extraIDs.forEach((extraID) => {
            player.SendCreatureQueryPacket(extraID);
        });
    });

    packetFunctions(events)
    reloadCommand(events)
}

function packetFunctions(events: TSEvents) {
    events.CustomPacket.OnReceive(ClientCallbackOperations.REQUEST_ITEMS, (op, packet, player) => {
        storePayload.BuildPacket().SendToPlayer(player);
    });

    events.CustomPacket.OnReceive(ClientCallbackOperations.REQUEST_POINTS, (op, packet, player) => {
        LoadAccountToCache(player.GetAccountID(), false);
        sendPoints(player);
    });

    events.CustomPacket.OnReceive(ClientCallbackOperations.BUY_ITEM, (op, packet, player) => {
        let buyPacket = new BuyItemPayload();
        buyPacket.read(packet);
        let tabIndex = buyPacket.TabIndex;
        let itemIndex = buyPacket.ItemIndex;

        if (!checkItem(tabIndex, itemIndex)) {
            console.log("Bad Item Purchase Data. Player:" + player.GetName() + " tabIndex: " + tabIndex + " itemIndex: " + itemIndex);
            player.SendAreaTriggerMessage("Store Item Not Found")
            return;
        }

        let itemObj = itemDict[tabIndex][itemIndex];

        if (checkIfPlayerPoor(player.GetAccountID(), itemObj.Cost)) {
            player.SendAreaTriggerMessage("You do not have enough points.")
            return;
        }

        //TODO: update this to have an array of itemIDs in the event we want to send more than 1 item later
        //TODO: update this to have itemQuantity in the event we want to send more than 1 item later
        let item = CreateItem(itemObj.PurchaseID, 1);
        if (!item) return
        let itemsToSend: TSArray<TSItem> = [];
        itemsToSend.push(item);

        decrementPoints(player, itemObj.Cost);
        logBuyItem(player, itemObj);

        player.SendGMMail("Your Purchase", "Thank you for your purchase", itemsToSend);
        sendPoints(player);
    });
}

function LoadAccountToCache(accountID: number, force: bool) {
    if (accountPoints.keys().includes(accountID) && !force) { return }
    const pointsQuery = QueryAuth(`SELECT donation_points FROM account WHERE id = ${accountID};`);
    while (pointsQuery.GetRow()) {
        let points = pointsQuery.GetInt32(0);
        if (points < 0) points = 0
        accountPoints.set(accountID, points);
    }
}

function logBuyItem(player: TSPlayer, item: StoreItem) {
    QueryWorld(`INSERT INTO store_audit (cost, name, description, account_id) VALUES (${item.Cost}, "${item.Name}", "${item.Description}", ${player.GetAccountID()})`);
}

function sendPoints(player: TSPlayer) {
    let payload = new DonationPointsPayload();
    payload.points = accountPoints[player.GetAccountID()];
    payload.BuildPacket().SendToPlayer(player);
}

function checkItem(tabIndex: number, itemIndex: number): boolean {
    if (!itemDict.contains(tabIndex)) return false;
    if (!itemDict[tabIndex].contains(itemIndex)) return false;
    return true;
}

function decrementPoints(player: TSPlayer, cost: number) {
    const accID = player.GetAccountID();
    QueryAuth(`UPDATE account SET donation_points = donation_points - ${cost} WHERE id = ${accID}`);
    accountPoints[accID] -= cost
}

function checkIfPlayerPoor(accID: number, cost: number) {
    if (accountPoints[accID] < cost) return true;
    return false;
}
function reloadCommand(events: TSEvents) {
    events.Player.OnCommand((player, command, found) => {
        if (player.IsPlayer() && player.IsInWorld()) {
            const commandText = command.get();

            if (commandText === "reload store_items") {
                if (player.GetGMRank() <= 3) {
                    storePayload = setupItems(itemDict);
                    player.SendAreaTriggerMessage("The 'store_items' table has been reloaded.");
                    player.SendBroadcastMessage("Store items have been successfully reloaded.");
                } else {
                    player.SendAreaTriggerMessage("You do not have the required GM level to use this command.");
                }
                found.set(true);
            }
        }
    })
}




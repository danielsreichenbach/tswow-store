import { StorePacketCallbacks } from "./storePacketCallbacks";

export function StoreLiveScript(events: TSEvents) {
    if (!verifyItemsInDB()) {
        return;
    }
    StorePacketCallbacks(events);
}

function verifyItemsInDB() {
    const data = QueryWorld(`SELECT purchase_id, id FROM store_items;`);
    while (data.GetRow()) {
        const itemID = data.GetUInt32(0);
        const storeID = data.GetUInt32(1);
        if (!GetItemTemplate(itemID)) {
            console.log(`Item ID mismatch in store item with ID: ${storeID}, no such item ID in item_template with ${itemID}`);
            return false;
        }
    }
    return true;
}

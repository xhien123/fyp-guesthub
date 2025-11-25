import { Router, Request, Response } from "express";
import MenuItem from "../models/MenuItem";

const router = Router();

// 1. CREATE
router.post("/", async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      photo, 
      restaurant, 
      mealType,
      quantity,
      isAvailable,
      available 
    } = req.body;

    if (!name || !price || !category || !restaurant) {
       return res.status(400).json({ error: "Missing required fields" });
    }

    const finalAvailability = typeof available === "boolean" ? available : (isAvailable ?? true);

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category, 
      photo,
      restaurant,
      mealType,
      quantity, // Saves the quantity correctly (null = unlimited)
      isAvailable: finalAvailability
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Could not create menu item" });
  }
});

// 2. UPDATE (With Smart Restock)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { available, isAvailable, quantity, ...otherUpdates } = req.body;

    const updates: any = { ...otherUpdates };
    if (quantity !== undefined) updates.quantity = quantity;

    // Handle Availability Change
    let newStatus: boolean | undefined = undefined;
    if (typeof available === "boolean") newStatus = available;
    else if (typeof isAvailable === "boolean") newStatus = isAvailable;

    if (newStatus !== undefined) {
      updates.isAvailable = newStatus;
      
      // 🔥 SMART LOGIC: If turning ON, but stock is 0, reset to Unlimited
      if (newStatus === true) {
         const currentItem = await MenuItem.findById(id);
         if (currentItem && (currentItem.quantity === 0 || updates.quantity === 0)) {
             // Only reset if the user didn't explicitly send a new quantity in this same request
             if (quantity === undefined) {
                 updates.quantity = null; // Reset to Unlimited
             }
         }
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Could not update item" });
  }
});

// 3. QUICK STATUS TOGGLE (With Smart Restock)
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable, available } = req.body;

    const newStatus = typeof available === "boolean" ? available : isAvailable;
    const updates: any = { isAvailable: newStatus };

    // 🔥 SMART LOGIC: If toggling ON, check if we need to restock
    if (newStatus === true) {
        const currentItem = await MenuItem.findById(id);
        // If currently Sold Out (0), reset to Unlimited (null) so it becomes sellable
        if (currentItem && (currentItem.quantity === 0)) {
            updates.quantity = null; 
        }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Could not toggle status" });
  }
});

// 4. DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete item" });
  }
});

export default router;
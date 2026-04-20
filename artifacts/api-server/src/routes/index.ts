import { Router, type IRouter } from "express";
import healthRouter from "./health";
import trackingRouter from "./tracking";
import shipmentsRouter from "./shipments";
import analyticsRouter from "./analytics";
import contactsRouter from "./contacts";
import testimonialsRouter from "./testimonials";
import settingsRouter from "./settings";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/track", trackingRouter);
router.use("/shipments", shipmentsRouter);
router.use("/analytics", analyticsRouter);
router.use("/contacts", contactsRouter);
router.use("/testimonials", testimonialsRouter);
router.use("/settings", settingsRouter);
router.use("/admin", adminRouter);
router.use(storageRouter);

export default router;

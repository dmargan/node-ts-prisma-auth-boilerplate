import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import catchAsync from "../utils/catchAsync";

const prisma = new PrismaClient();

const getProducts = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });

    res.json(products);
  }
);

export default { getProducts };

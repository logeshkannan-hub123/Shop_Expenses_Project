import request from "supertest";
import { beforeAll, describe, it, expect } from "vitest";
import app from "../app.js";
import dotenv from "dotenv";

dotenv.config();

let authToken = "";

describe("GET /getMaterial", () => {
  beforeAll(async () => {
    const res = await request(app).post("/login").send({
      user_id: process.env.ADMIN_USER_ID,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    authToken = res.body.token;
  });

  it("should return an array of objects", async () => {
    const response = await request(app)
      .get("/getMaterial")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach((material) => {
      expect(material).toHaveProperty("id");
      expect(material).toHaveProperty("name");
      expect(material).toHaveProperty("quantity_of_measure");
      expect(material).toHaveProperty("unit_quantity");
    });
  });

  it("should return an array of objects", async () => {
    const response = await request(app)
      .get("/getVender")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach((vendor) => {
      expect(vendor).toHaveProperty("id");
      expect(vendor).toHaveProperty("name");
      expect(vendor).toHaveProperty("phone_no");
      expect(vendor).toHaveProperty("address");
    });
  });

  it("should return an array with a single material object", async () => {
    const materialId = 1;

    const response = await request(app)
      .get(`/getMaterialById/${materialId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const material = response.body[0];

    expect(material).toHaveProperty("id");
    expect(material).toHaveProperty("name");
    expect(material).toHaveProperty("quantity_of_measure");
    expect(material).toHaveProperty("unit_quantity");
  });

  it("should return an array with a single vendor object", async () => {
    const vendorId = 1;

    const response = await request(app)
      .get(`/getVenderById/${vendorId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    // Your API returns an array (from MySQL)
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const vendor = response.body[0];

    expect(vendor).toHaveProperty("id");
    expect(vendor).toHaveProperty("name");
    expect(vendor).toHaveProperty("phone_no");
    expect(vendor).toHaveProperty("address");
  });
});

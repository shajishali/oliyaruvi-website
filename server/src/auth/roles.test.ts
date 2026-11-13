import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { VerifiedAdmin } from "./access";
import {
  canEditContent,
  canManageLive,
  canManageMedia,
  canManageOrders,
  isSuperAdmin,
} from "./roles";

function admin(roles: string[]): VerifiedAdmin {
  return { userId: "u1", email: "u@example.com", roles };
}

describe("role helpers", () => {
  it("gives content editors content access but not orders", () => {
    const editor = admin(["content_editor"]);
    assert.equal(canEditContent(editor), true);
    assert.equal(canManageOrders(editor), false);
    assert.equal(canManageLive(editor), false);
  });

  it("gives live managers live access but not theme/content", () => {
    const live = admin(["live_event_manager"]);
    assert.equal(canManageLive(live), true);
    assert.equal(canEditContent(live), false);
    assert.equal(canManageOrders(live), false);
  });

  it("gives order managers order access only", () => {
    const orders = admin(["order_manager"]);
    assert.equal(canManageOrders(orders), true);
    assert.equal(canEditContent(orders), false);
    assert.equal(canManageMedia(orders), false);
  });

  it("treats super admin as all-capable", () => {
    const owner = admin(["super_admin"]);
    assert.equal(isSuperAdmin(owner), true);
    assert.equal(canEditContent(owner), true);
    assert.equal(canManageOrders(owner), true);
    assert.equal(canManageLive(owner), true);
  });
});

describe("SQL authorization checks", () => {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../../../supabase/migrations/20261113120000_foundation.sql"),
    "utf8",
  );

  it("does not grant table insert/update/delete to anon", () => {
    assert.equal(/for insert to anon/i.test(sql), false);
    assert.equal(/for update to anon/i.test(sql), false);
    assert.equal(/for delete to anon/i.test(sql), false);
    assert.equal(/for all to anon/i.test(sql), false);
  });

  it("scopes theme writes to content editors", () => {
    assert.match(sql, /create policy theme_staff_all[\s\S]*can_edit_content/);
  });

  it("scopes bookings and orders to order managers", () => {
    assert.match(sql, /create policy bookings_staff[\s\S]*can_manage_orders/);
    assert.match(sql, /create policy orders_staff[\s\S]*can_manage_orders/);
  });

  it("scopes live events to live managers", () => {
    assert.match(sql, /create policy events_staff[\s\S]*can_manage_live/);
  });

  it("only exposes form submit RPCs to anon", () => {
    assert.match(sql, /grant execute on function public\.submit_booking[\s\S]*to anon/);
    assert.match(sql, /grant execute on function public\.submit_enquiry[\s\S]*to anon/);
  });
});

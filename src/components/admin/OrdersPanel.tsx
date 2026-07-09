import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Trash2, RefreshCw, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  adminCreateOrder,
  adminDeleteOrder,
  adminGetOrder,
  adminListOrders,
  adminUpdateOrderStatus,
} from "@/lib/admin.functions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/catalog.types";

type StatusFilter = OrderStatus | "all";

type ItemDraft = {
  title: string;
  quantity: string;
  unit_price: string;
};

const emptyItem: ItemDraft = { title: "", quantity: "1", unit_price: "" };

type OrderForm = {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  status: OrderStatus;
  notes: string;
  items: ItemDraft[];
};

const emptyOrderForm: OrderForm = {
  customer_name: "",
  customer_email: "",
  shipping_address: "",
  status: "pending",
  notes: "",
  items: [{ ...emptyItem }],
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-neutral-200 text-neutral-700",
  refunded: "bg-rose-100 text-rose-800",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersPanel({ token }: { token: string }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [creating, setCreating] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: () => adminListOrders({ data: { token, status: filter } }),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: OrderStatus }) =>
      adminUpdateOrderStatus({ data: { token, ...vars } }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteOrder({ data: { token, id } }),
    onSuccess: () => {
      toast.success("Order deleted");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="status-filter" className="text-xs uppercase tracking-wider">
            Filter
          </Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> New order
        </Button>
      </div>

      <OrdersSummary orders={ordersQuery.data ?? []} />

      <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {ordersQuery.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {ordersQuery.isError && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-destructive">
                  Failed to load orders.
                </td>
              </tr>
            )}
            {ordersQuery.data?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
            {ordersQuery.data?.map((o) => (
              <tr key={o.id} className="border-t border-[var(--brand-hairline)]">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                </td>
                <td className="px-4 py-3">{o.item_count ?? 0}</td>
                <td className="px-4 py-3 font-semibold">${o.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Select
                    value={o.status}
                    onValueChange={(v) => statusMut.mutate({ id: o.id, status: v as OrderStatus })}
                  >
                    <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <StatusBadge status={o.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(o.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setViewingId(o.id)}
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete order #${o.id.slice(0, 8)}?`)) deleteMut.mutate(o.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewOrderDialog open={creating} onOpenChange={setCreating} token={token} />
      <OrderDetailsDialog orderId={viewingId} onClose={() => setViewingId(null)} token={token} />
    </div>
  );
}

function OrdersSummary({ orders }: { orders: Order[] }) {
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;

  const cards = [
    { label: "Orders", value: String(orders.length) },
    { label: "Pending", value: String(pending) },
    { label: "Shipped", value: String(shipped) },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-[var(--brand-hairline)] bg-background p-4"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
          <div className="mt-1 text-2xl font-semibold">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function NewOrderDialog({
  open,
  onOpenChange,
  token,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  token: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<OrderForm>(emptyOrderForm);
  const [error, setError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: {
      customer_name: string;
      customer_email: string;
      shipping_address: string;
      status: OrderStatus;
      notes: string;
      items: {
        title: string;
        quantity: number;
        unit_price: number;
      }[];
    }) => adminCreateOrder({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Order created");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      setForm(emptyOrderForm);
      setError(null);
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message || "Create failed"),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = form.customer_name.trim();
    const email = form.customer_email.trim();
    if (!name) return setError("Customer name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Valid customer email is required.");
    const parsedItems: { title: string; quantity: number; unit_price: number }[] = [];
    for (const [i, it] of form.items.entries()) {
      const title = it.title.trim();
      const qty = Number(it.quantity);
      const price = Number(it.unit_price);
      if (!title) return setError(`Item ${i + 1}: title is required.`);
      if (!Number.isInteger(qty) || qty < 1)
        return setError(`Item ${i + 1}: quantity must be a positive integer.`);
      if (!Number.isFinite(price) || price < 0)
        return setError(`Item ${i + 1}: unit price must be non-negative.`);
      parsedItems.push({ title, quantity: qty, unit_price: price });
    }
    if (parsedItems.length === 0) return setError("Order needs at least one item.");
    createMut.mutate({
      customer_name: name,
      customer_email: email,
      shipping_address: form.shipping_address.trim(),
      status: form.status,
      notes: form.notes,
      items: parsedItems,
    });
  }

  const total = form.items.reduce((sum, it) => {
    const q = Number(it.quantity);
    const p = Number(it.unit_price);
    if (!Number.isFinite(q) || !Number.isFinite(p)) return sum;
    return sum + q * p;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="o-name">Customer name</Label>
              <Input
                id="o-name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="o-email">Customer email</Label>
              <Input
                id="o-email"
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="o-addr">Shipping address</Label>
            <Textarea
              id="o-addr"
              value={form.shipping_address}
              onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="o-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as OrderStatus })}
              >
                <SelectTrigger id="o-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="o-notes">Notes</Label>
              <Input
                id="o-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Internal note (optional)"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add item
              </Button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_100px_auto] gap-2">
                  <Input
                    placeholder="Product title"
                    value={it.title}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...it, title: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                  />
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...it, quantity: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit $"
                    value={it.unit_price}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...it, unit_price: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={form.items.length === 1}
                    onClick={() => {
                      const next = form.items.filter((_, i) => i !== idx);
                      setForm({ ...form, items: next });
                    }}
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end text-sm">
              <span className="text-muted-foreground">Total:&nbsp;</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating…" : "Create order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailsDialog({
  orderId,
  onClose,
  token,
}: {
  orderId: string | null;
  onClose: () => void;
  token: string;
}) {
  const query = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => adminGetOrder({ data: { token, id: orderId as string } }),
    enabled: !!orderId,
  });

  return (
    <Dialog open={!!orderId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{orderId ? `Order #${orderId.slice(0, 8)}` : "Order"}</DialogTitle>
        </DialogHeader>
        {query.isLoading && <p className="py-8 text-center text-muted-foreground">Loading…</p>}
        {query.data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
                <p className="mt-1 font-medium">{query.data.customer_name}</p>
                <p className="text-sm text-muted-foreground">{query.data.customer_email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={query.data.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Placed {formatDate(query.data.created_at)}
                </p>
              </div>
            </div>

            {query.data.shipping_address && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Shipping address
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">{query.data.shipping_address}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Items</p>
              <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 w-16 text-right">Qty</th>
                      <th className="px-3 py-2 w-24 text-right">Unit</th>
                      <th className="px-3 py-2 w-24 text-right">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.items.map((it) => (
                      <tr key={it.id} className="border-t border-[var(--brand-hairline)]">
                        <td className="px-3 py-2">{it.title}</td>
                        <td className="px-3 py-2 text-right">{it.quantity}</td>
                        <td className="px-3 py-2 text-right">${it.unit_price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          ${(it.unit_price * it.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--brand-hairline)] bg-[var(--brand-muted)]/50">
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        ${query.data.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {query.data.notes && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-line text-sm">{query.data.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

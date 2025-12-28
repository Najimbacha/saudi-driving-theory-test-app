import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Signs from "@/pages/Signs";
import { AppProvider } from "@/context/AppContext";
import { ksaSigns } from "@/data/ksaSigns";

const renderSigns = () => {
  return render(
    <AppProvider>
      <MemoryRouter>
        <Signs />
      </MemoryRouter>
    </AppProvider>
  );
};

describe("Signs page", () => {
  it("loads sign data without duplicate ids", () => {
    const uniqueIds = new Set(ksaSigns.map((sign) => sign.id));
    expect(uniqueIds.size).toBe(ksaSigns.length);
  });

  it("renders signs on first page without duplicate entries", () => {
    renderSigns();
    const images = screen.getAllByRole("img");
    const alts = images.map((img) => img.getAttribute("alt"));
    const unique = new Set(alts);
    expect(unique.size).toBe(alts.length);
  });

  it("filters by category", async () => {
    const categories = Array.from(new Set(ksaSigns.map((sign) => sign.category)));
    const primaryCategory = categories[0];
    const secondaryCategory = categories.find((category) => category !== primaryCategory);
    const primarySign = ksaSigns.find((sign) => sign.category === primaryCategory);
    const secondarySign = secondaryCategory
      ? ksaSigns.find((sign) => sign.category === secondaryCategory)
      : null;

    expect(primarySign).toBeTruthy();

    const user = userEvent.setup();
    renderSigns();

    await user.click(screen.getByRole("button", { name: new RegExp(primaryCategory, "i") }));

    const searchInput = screen.getByPlaceholderText(/search signs/i);
    await user.clear(searchInput);
    await user.type(searchInput, primarySign!.title.en);

    expect(screen.getByText(primarySign!.title.en)).toBeInTheDocument();

    if (secondarySign) {
      await user.clear(searchInput);
      await user.type(searchInput, secondarySign.title.en);
      expect(screen.queryByText(secondarySign.title.en)).not.toBeInTheDocument();
    }
  });

  it("supports text search in English", async () => {
    const target = ksaSigns[0];
    const user = userEvent.setup();

    renderSigns();
    const searchInput = screen.getByPlaceholderText(/search signs/i);

    await user.type(searchInput, target.title.en);
    expect(screen.getByText(target.title.en)).toBeInTheDocument();
  });

  it("opens sign details without crashing", async () => {
    const target = ksaSigns[0];
    const user = userEvent.setup();

    renderSigns();
    const searchInput = screen.getByPlaceholderText(/search signs/i);
    await user.type(searchInput, target.title.en);

    await user.click(screen.getByText(target.title.en));
    expect(screen.getAllByText(target.title.en)[0]).toBeInTheDocument();
  });
});

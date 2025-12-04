import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import rehooz_square from "../rehooz-square.png";

const API_BASE_URL = "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function Listing() {
	const { listingId } = useParams();
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sellerDetails, setSellerDetails] = useState(null);
	const [listingFollowers, setListingFollowers] = useState(null);
	const [metaError, setMetaError] = useState(null);
	const [isFollowingSeller, setIsFollowingSeller] = useState(null);
	const [form, setForm] = useState({ name: "", price: "", description: "", location: "" });
	const [message, setMessage] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingListing, setEditingListing] = useState(null);

	const user = useMemo(() => {
		const stored = localStorage.getItem("user");
		return stored ? JSON.parse(stored) : null;
	}, []);
	const userId = user?.user_id;

	useEffect(() => {
		const controller = new AbortController();

		const fetchListing = async () => {
			if (!listingId) return;
			setLoading(true);
			setError(null);

			try {
				const res = await fetch(`${API_BASE_URL}/get_all_listings.php`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new Error(`HTTP error ${res.status}`);
				const raw = await res.json();
				const listings = Array.isArray(raw)
					? raw
					: raw.status === "success"
					? raw.listings || []
					: [];

				const match = listings.find(
					(item) => String(item.listing_id) === String(listingId)
				);

				if (!match) {
					setError("Listing not found.");
					setListing(null);
				} else {
					setListing(match);
				}
			} catch (err) {
				if (err.name !== "AbortError") {
					console.error("Failed to load listing", err);
					setError("Unable to load this listing right now.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchListing();

		return () => controller.abort();
	}, [listingId]);

	const price = useMemo(() => {
		if (!listing) return "";
		const value = parseFloat(listing.price);
		return Number.isFinite(value) ? value.toFixed(2) : listing.price;
	}, [listing]);

	const photoSrc = listing?.photo ? listing.photo : rehooz_square;

	useEffect(() => {
		if (!listing || !listing.listing_id || !listing.seller_id) {
			setSellerDetails(null);
			setListingFollowers(null);
			setIsFollowingSeller(null);
			return;
		}

		const controller = new AbortController();
		const fetchMeta = async () => {
			setMetaError(null);
			try {
				const [userRes, followerRes] = await Promise.all([
					fetch(
						`${API_BASE_URL}/get_user_followers.php?user_id=${listing.seller_id}`,
						{ signal: controller.signal }
					),
					fetch(
						`${API_BASE_URL}/get_listing_followers.php?listing_id=${listing.listing_id}`,
						{ signal: controller.signal }
					),
				]);

				if (!userRes.ok) throw new Error("Failed to fetch seller details");
				if (!followerRes.ok)
					throw new Error("Failed to fetch listing followers");

				const userData = await userRes.json();
				const listingData = await followerRes.json();

				if (userData.status === "success") {
					setSellerDetails(userData.user);
				} else {
					setSellerDetails(null);
				}

				if (listingData.status === "success") {
					const count = Number(listingData.follower_count ?? 0);
					setListingFollowers(Number.isFinite(count) ? count : 0);
				} else {
					setListingFollowers(0);
				}
			} catch (err) {
				if (err.name !== "AbortError") {
					console.error("Metadata fetch failed", err);
					setMetaError("Some listing details are unavailable right now.");
				}
			}
		};

		// also check whether current user follows this seller
		const checkFollowing = async () => {
			if (!user || !user.user_id) {
				setIsFollowingSeller(null);
				return;
			}

			try {
				const res = await fetch(`${API_BASE_URL}/get_connections.php`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ user_id: user.user_id }),
					signal: controller.signal,
				});
				if (!res.ok) throw new Error("Failed to fetch connections");
				const data = await res.json();
				if (data.status === "success" && Array.isArray(data.following)) {
					const found = data.following.some((f) => Number(f.user_id) === Number(listing.seller_id));
					setIsFollowingSeller(Boolean(found));
				} else {
					setIsFollowingSeller(false);
				}
			} catch (err) {
				if (err.name !== "AbortError") console.warn("Could not determine following status", err);
				setIsFollowingSeller(false);
			}
		};

		fetchMeta();
		checkFollowing();
		return () => controller.abort();
	}, [listing]);

	const openEditModal = (listingToEdit) => {
		if (String(listingToEdit.seller_id) !== String(userId)) return;

		setEditingListing(listingToEdit);
		setForm({
			name: listingToEdit.name || "",
			price: listingToEdit.price || "",
			description: listingToEdit.description || "",
			location: listingToEdit.location || "",
		});
		setMessage("");
		setIsModalOpen(true);
	};

	const updateListing = async () => {
		if (!editingListing) return;

		const res = await fetch(`${API_BASE_URL}/update_listing.php`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				user_id: userId,
				listing_id: editingListing.listing_id,
				name: form.name,
				price: form.price,
				description: form.description,
				location: form.location,
			}),
		});

		const data = await res.json();
		setMessage(data.message || "");

		if (data.status === "success") {
			setListing((prev) =>
				prev
					? {
						...prev,
						name: form.name,
						price: form.price,
						description: form.description,
						location: form.location,
					}
					: prev
			);
			setIsModalOpen(false);
			setEditingListing(null);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!userId) {
			setMessage("Please sign in again to add or edit a listing.");
			return;
		}

		if (editingListing) {
			await updateListing();
		}
	};

	const handleFollowSeller = async () => {
		if (!user || !user.user_id) return alert("Please log in to follow users.");
		const sellerId = listing?.seller_id;
		if (!sellerId) return;
		try {
			const res = await fetch(`${API_BASE_URL}/follow_user.php`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_id: user.user_id, follow_id: sellerId }),
			});
			const data = await res.json();
			if (data.status === "success") {
				setIsFollowingSeller(true);
				// refresh seller details follower count
				const r = await fetch(`${API_BASE_URL}/get_user_followers.php?user_id=${sellerId}`);
				if (r.ok) {
					const ud = await r.json();
					if (ud.status === "success") setSellerDetails(ud.user);
				}
			} else {
				console.warn("Follow user failed", data.message);
			}
		} catch (err) {
			console.error("Follow request failed", err);
		}
	};

	const handleUnfollowSeller = async () => {
		if (!user || !user.user_id) return alert("Please log in to unfollow users.");
		const sellerId = listing?.seller_id;
		if (!sellerId) return;
		try {
			const res = await fetch(`${API_BASE_URL}/unfollow_user.php`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_id: user.user_id, follow_id: sellerId }),
			});
			const data = await res.json();
			if (data.status === "success") {
				setIsFollowingSeller(false);
				const r = await fetch(`${API_BASE_URL}/get_user_followers.php?user_id=${sellerId}`);
				if (r.ok) {
					const ud = await r.json();
					if (ud.status === "success") setSellerDetails(ud.user);
				}
			} else {
				console.warn("Unfollow user failed", data.message);
			}
		} catch (err) {
			console.error("Unfollow request failed", err);
		}
	};
	const origin = useMemo(() => {
		if (typeof window === "undefined") return "";
		return window.location.origin;
	}, []);

	const sellerDisplayName = useMemo(() => {
		if (sellerDetails?.username) return sellerDetails.username;
		if (listing?.seller_name) return listing.seller_name;
		if (listing?.seller_id) return `User #${listing.seller_id}`;
		return "Seller";
	}, [sellerDetails?.username, listing?.seller_name, listing?.seller_id]);

	const sellerFollowerDescriptor = useMemo(() => {
		if (typeof sellerDetails?.follower_count !== "number") return null;
		const count = sellerDetails.follower_count;
		const label = count === 1 ? "follower" : "followers";
		return `${count} ${label}`;
	}, [sellerDetails?.follower_count]);

	const isOwner = useMemo(() => {
		if (!user || !listing) return false;
		return String(listing.seller_id) === String(user.user_id);
	}, [user, listing]);

	const [listingOffers, setListingOffers] = useState([]);

useEffect(() => {
	if (!listing || !listing.listing_id) return; // wait for listing to load

	async function loadOffers() {
		try {
			const res = await fetch(
				`${API_BASE_URL}/get_all_offers.php?listing_id=${listing.listing_id}`
			);
			const data = await res.json();
			if (data.status === "success") {
				setListingOffers(data.offers);
			} else {
				setListingOffers([]);
			}
		} catch (err) {
			console.error("Error fetching offers", err);
			setListingOffers([]);
		}
	}

	loadOffers();
}, [listing]);

	return (
		<main className="page-content listing-detail-page">
			<div className="listing-detail-card">
				<div className="listing-detail-header">
					<div>
						<Link to="/browse" className="listing-back-link">
							← Back to Browse
						</Link>
						<h2>Listing Details</h2>
						{listing && (
							<p className="listing-detail-id">Listing #{listing.listing_id}</p>
						)}
					</div>
					<div className="listing-header-actions">
						<button
							type="button"
							className="Goto-listing place-offer-btn"
							onClick={() => alert("Offer placement coming soon!")}
							disabled={!listing}
						>
							Place Offer
						</button>
						{isOwner && listing && (
							<button
								type="button"
								className="Edit-listing"
								onClick={() => openEditModal(listing)}
							>
								Edit Listing
							</button>
						)}
					</div>
				</div>

				{isModalOpen && (
					<div className="modal-overlay" role="dialog" aria-modal="true">
						<div className="home-card modal-card">
							<div className="modal-close-row">
								<h4 style={{ margin: 0 }}>
									{editingListing ? "Edit Listing" : "Add a New Listing"}
								</h4>
								<button
									type="button"
									onClick={() => {
										setIsModalOpen(false);
										setEditingListing(null);
									}}
									className="modal-close-btn"
								>
									×
								</button>
							</div>

							<img src={rehooz_square} alt="Rehooz" className="home-logo modal-logo" />

							<form onSubmit={handleSubmit}>
								<input
									name="name"
									placeholder="Item Name"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									required
								/>
								<input
									name="price"
									placeholder="Price"
									type="number"
									value={form.price}
									onChange={(e) => setForm({ ...form, price: e.target.value })}
									required
								/>
								<input
									name="location"
									placeholder="Location"
									value={form.location}
									onChange={(e) => setForm({ ...form, location: e.target.value })}
									required
								/>
								<textarea
									name="description"
									placeholder="Description"
									value={form.description}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
									required
								/>

								<button type="submit" className="modal-submit-btn">
									{editingListing ? "Save Changes" : "Add Listing"}
								</button>
							</form>

							{message && <p className="modal-message">{message}</p>}
						</div>
					</div>
				)}

				{loading && <p>Loading listing…</p>}
				{error && <p className="listing-error">{error}</p>}

				{!loading && !error && listing && (
					<>
						<div className="listing-detail-body">
							<div className="listing-photo-panel">
								<img src={photoSrc} alt={listing.name} />
							</div>

							<div className="listing-info-panel">
								<div className="listing-info-row">
									<h3>{listing.name}</h3>
									{price && <span className="listing-price">${price}</span>}
								</div>

								{listing.location && (
									<p className="listing-location">Located in {listing.location}</p>
								)}

								<p className="listing-description">{listing.description}</p>

								<div className="listing-meta">
									<span>Seller:</span>
									<span className="listing-seller-name">{sellerDisplayName}</span>

									{user ? (
										isFollowingSeller === null ? (
											<span className="listing-follow-loading">…</span>
										) : isFollowingSeller ? (
											<button className="seller-unfollow-btn" onClick={handleUnfollowSeller}>
												Unfollow
											</button>
										) : (
											<button className="seller-follow-btn" onClick={handleFollowSeller}>
												Follow
											</button>
										)
									) : (
										<p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Log in to follow</p>
									)}

									{sellerFollowerDescriptor && (
										<span className="listing-meta-followers">• {sellerFollowerDescriptor}</span>
									)}
								</div>

								{metaError && (
									<p className="listing-meta-error">{metaError}</p>
								)}

								<div className="listing-share-hint">
									Share this listing: {origin}/listing/{listing.listing_id}
								</div>

								<div className="listing-followers-pill" aria-live="polite">
									<span>Listing followers</span>
									<strong>
										{typeof listingFollowers === "number" ? listingFollowers : "—"}
									</strong>
								</div>
							</div>
						</div>

						<section className="listing-offers-section">
							<div className="listing-offers-header">
								<h3>Offers</h3>
								<span className="listing-offers-count">
      								{listingOffers.length} offer{listingOffers.length !== 1 ? "s" : ""}
    							</span>
  							</div>

  							{listingOffers.length === 0 ? (
    							<p className="listing-offers-empty">No offers yet.</p>
  							) : (
    							<ul className="listing-offers-list">
      								{listingOffers.map((offer) => (
        							<li key={offer.offer_id} className="listing-offer-item">
          								<strong>{offer.buyer_username}</strong> offered{" "}
          								<span className="offer-amount">${offer.monetary_amount}</span>
        							</li>
      								))}
    							</ul>
 							 )}
						</section>
					</>
				)}

				{user && !loading && !error && !listing && (
					<p>
						Need help? Share this link with support so we can look up listing
						#{listingId}.
					</p>
				)}
			</div>
		</main>
	);
}

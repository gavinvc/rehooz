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

	const user = useMemo(() => {
		const stored = localStorage.getItem("user");
		return stored ? JSON.parse(stored) : null;
	}, []);

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
	const sellerProfileLink = useMemo(() => {
		const sellerId = sellerDetails?.user_id || listing?.seller_id;
		return sellerId ? `/profile/${sellerId}` : "/profile";
	}, [sellerDetails?.user_id, listing?.seller_id]);

	useEffect(() => {
		if (!listing || !listing.listing_id || !listing.seller_id) {
			setSellerDetails(null);
			setListingFollowers(null);
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

		fetchMeta();
		return () => controller.abort();
	}, [listing]);
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
					<button
						type="button"
						className="Goto-listing place-offer-btn"
						onClick={() => alert("Offer placement coming soon!")}
						disabled={!listing}
					>
						Place Offer
					</button>
				</div>

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
									<Link className="listing-seller-link" to={sellerProfileLink}>
										{sellerDisplayName}
									</Link>
									{sellerFollowerDescriptor && (
										<span className="listing-meta-followers">
											• {sellerFollowerDescriptor}
										</span>
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
								<span className="listing-offers-count">Coming soon</span>
							</div>
							<p className="listing-offers-empty">
								Offer history and messaging will appear here once the offer
								feature launches.
							</p>
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

import React from 'react';
import Layout from '../../components/Layout';
import './Help.css';

const Help = () => {
	return (
		<Layout title="Help">
			<div className="help-container">
				{/* Header */}
				<div className="card help-header">
					<h2 className="help-title">Help & Guide</h2>
					<p className="help-subtitle">Quick tips to get around and complete common tasks.</p>
				</div>

				{/* Sections */}
				<div className="help-sections">
					<section className="help-section">
						<h3 className="help-section-title">Getting started</h3>
						<ul className="help-list">
							<li>Dashboard is your home after login.</li>
							<li>Use the sidebar to navigate Inventory, Pricing, Reports, and Profile.</li>
							<li>If a section looks empty, look for an “Add …” button to create your first entry.</li>
						</ul>
					</section>

					<section className="help-section">
						<h3 className="help-section-title">Common tasks</h3>
						<ul className="help-list">
							<li><span className="help-strong">Add Business Info:</span> Go to Profile → Business Information → Add Business Information.</li>
							<li><span className="help-strong">Edit Owner Info:</span> Profile → Business Owner Information → Edit.</li>
							<li><span className="help-strong">View Reports:</span> Reports → pick a card (Sales & Revenue, Stocks, Add/Delete/Update).</li>
							<li><span className="help-strong">Search:</span> Look for inputs with a magnifying glass icon.</li>
						</ul>
					</section>

					<section className="help-section">
						<h3 className="help-section-title">Reports guide</h3>
						<ul className="help-list">
							<li><span className="help-strong">Sales & Revenue:</span> Daily sold items and totals; filter by period when available.</li>
							<li><span className="help-strong">Stocks:</span> View current item stock status.</li>
							<li><span className="help-strong">Add/Delete/Update:</span> Review item changes (audit-style view).</li>
						</ul>
					</section>

					<section className="help-section">
						<h3 className="help-section-title">Troubleshooting</h3>
						<ul className="help-list">
							<li><span className="help-strong">Nothing shows on a page:</span> Check if there’s an “Add …” button for first-time setup.</li>
							<li><span className="help-strong">Date input placeholder doesn’t change:</span> Native date pickers ignore placeholders; select a date directly.</li>
							<li><span className="help-strong">Dropdown icon not aligned:</span> Use a wrapper with a custom icon instead of placing icons inside select options.</li>
						</ul>
					</section>

					<section className="help-section">
						<h3 className="help-section-title">Contact</h3>
						<p className="help-text">Need more help? Reach out to support or file an issue in your repository.</p>
					</section>
				</div>
			</div>
		</Layout>
	);
};

export default Help;


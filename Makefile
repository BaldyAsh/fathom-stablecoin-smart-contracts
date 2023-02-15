deploy:
	coralX scenario --run deployApothem
	coralX execute --network apothem --path scripts/ankrIntTest/apothem_positionOpening.js
	coralX execute --network apothem --path scripts/ankrIntTest/apothem_depositSSM.js                                               
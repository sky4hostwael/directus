export const drivers = {
	sqlite3: 'SQLite',
	mysql: 'MySQL (/ MariaDB / Aurora)',
	pg: 'PostgreSQL (/ Amazon Redshift)',
	oracledb: 'Oracle Database',
	mssql: 'Microsoft SQL Server',
};

export function getDriverForClient(client: string) {
	for (const [key, value] of Object.entries(drivers)) {
		if (value === client) return key;
	}
}

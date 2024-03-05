import Fastify from 'fastify';

export default async function () {
	const fastify = Fastify({
		logger: true,
	});

	fastify.get('/api/', async (request, reply) => {
		reply.type('application/json').code(200);
		return { hello: 'world' };
	});

	await fastify.listen({ port: 3000 });
}

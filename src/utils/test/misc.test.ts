import { createNestedFields, getNestedFields } from "../misc";

describe("misc functions test", () => {
	it("createNestedFields test", () => {
		const fields = ["a", "b", "c", "d"];
		const object = {};
		const newObject = createNestedFields(fields, object);

		const wantedResult = { a: { b: { c: { d: {} } } } };
		expect(newObject).toMatchObject(wantedResult);
	});

	it("getNestedFields test", () => {
		const fields = ["a", "b", "c", "d", "e", "g", "h"];
		const object = { a: { b: { c: { d: { e: { g: { h: "hello" } } } } } } };
		const newObject = getNestedFields(fields, object);

		const wantedResult = { h: "hello" };
		expect(newObject).toMatchObject(wantedResult);
	});

	it("getNestedFields test, but some nested fields are missing", () => {
		const fields = ["a", "b", "c", "d", "e", "g", "h"];
		const object = { a: { b: { c: {} } } };
		const newObject = getNestedFields(fields, object);

		const wantedResult = { h: {} };
		expect(newObject).toMatchObject(wantedResult);
	});
});

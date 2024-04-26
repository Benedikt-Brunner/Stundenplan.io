//@ts-nocheck
export default class StyleClass {
	/**
	 * @param {Object} StyleDTO - An object containing the style properties
	 * @param {String} StyleDTO.primaryColor - The primary color of the schedule
	 * @param {String} StyleDTO.secondaryColor - The secondary color of the schedule
	 * @param {String} StyleDTO.tableHeaderMondayFontColor - The font color of the Monday table header
	 * @param {String} StyleDTO.tableHeaderTuesdayFontColor - The font color of the Tuesday table header
	 * @param {String} StyleDTO.tableHeaderWednesdayFontColor - The font color of the Wednesday table header
	 * @param {String} StyleDTO.tableHeaderThursdayFontColor - The font color of the Thursday table header
	 * @param {String} StyleDTO.tableHeaderFridayFontColor - The font color of the Friday table header
	 * @param {String} StyleDTO.tableHeaderSaturdayFontColor - The font color of the Saturday table header
	 * @param {String} StyleDTO.tableHeaderSundayFontColor - The font color of the Sunday table header
	 * @param {String} StyleDTO.tableHeaderMondayBackgroundColor - The background color of the Monday table header
	 * @param {String} StyleDTO.tableHeaderTuesdayBackgroundColor - The background color of the Tuesday table header
	 * @param {String} StyleDTO.tableHeaderWednesdayBackgroundColor - The background color of the Wednesday table header
	 * @param {String} StyleDTO.tableHeaderThursdayBackgroundColor - The background color of the Thursday table header
	 * @param {String} StyleDTO.tableHeaderFridayBackgroundColor - The background color of the Friday table header
	 * @param {String} StyleDTO.tableHeaderSaturdayBackgroundColor - The background color of the Saturday table header
	 * @param {String} StyleDTO.tableHeaderSundayBackgroundColor - The background color of the Sunday table header
	 * @param {Array<String>} StyleDTO.groupsColorPalette - The color palette for the groups
	 */
	constructor({
		primaryColor,
		secondaryColor,
		tableHeaderMondayFontColor,
		tableHeaderTuesdayFontColor,
		tableHeaderWednesdayFontColor,
		tableHeaderThursdayFontColor,
		tableHeaderFridayFontColor,
		tableHeaderSaturdayFontColor,
		tableHeaderSundayFontColor,
		tableHeaderMondayBackgroundColor,
		tableHeaderTuesdayBackgroundColor,
		tableHeaderWednesdayBackgroundColor,
		tableHeaderThursdayBackgroundColor,
		tableHeaderFridayBackgroundColor,
		tableHeaderSaturdayBackgroundColor,
		tableHeaderSundayBackgroundColor,
		groupsColorPalette,
	}) {
		this.primaryColor = primaryColor;
		this.secondaryColor = secondaryColor;
		this.tableHeaderMondayFontColor = tableHeaderMondayFontColor;
		this.tableHeaderTuesdayFontColor = tableHeaderTuesdayFontColor;
		this.tableHeaderWednesdayFontColor = tableHeaderWednesdayFontColor;
		this.tableHeaderThursdayFontColor = tableHeaderThursdayFontColor;
		this.tableHeaderFridayFontColor = tableHeaderFridayFontColor;
		this.tableHeaderSaturdayFontColor = tableHeaderSaturdayFontColor;
		this.tableHeaderSundayFontColor = tableHeaderSundayFontColor;
		this.tableHeaderMondayBackgroundColor = tableHeaderMondayBackgroundColor;
		this.tableHeaderTuesdayBackgroundColor = tableHeaderTuesdayBackgroundColor;
		this.tableHeaderWednesdayBackgroundColor = tableHeaderWednesdayBackgroundColor;
		this.tableHeaderThursdayBackgroundColor = tableHeaderThursdayBackgroundColor;
		this.tableHeaderFridayBackgroundColor = tableHeaderFridayBackgroundColor;
		this.tableHeaderSaturdayBackgroundColor = tableHeaderSaturdayBackgroundColor;
		this.tableHeaderSundayBackgroundColor = tableHeaderSundayBackgroundColor;
		this.groupsColorPalette = groupsColorPalette;
	}
}

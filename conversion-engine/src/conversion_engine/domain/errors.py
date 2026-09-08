class ConversionError(Exception):
    code = "CONVERSION_FAILED"


class InvalidPdfError(ConversionError):
    code = "INVALID_PDF"


class EncryptedPdfError(ConversionError):
    code = "ENCRYPTED_PDF"


class ScannedPdfError(ConversionError):
    code = "SCAN_REQUIRES_OCR"


class ResourceLimitError(ConversionError):
    code = "RESOURCE_LIMIT"

import msgspec

naming_convention = {"payload": "p", "data": "d"}


class Frame(msgspec.Struct, rename=naming_convention, tag_field="t"):
    """
    client frame structure.

    **Example:**
    ```json
    {"t":"newgame","d":{"wp":"ravioli"}}
    ```
    """

    ...


class Msg(msgspec.Struct, rename=naming_convention, tag_field="t"):
    """
    internal message structure
    """

    def __contains__(self, key):
        if key == "t":
            return True
        return key in self.__struct_fields__

    def __getitem__(self, key):
        if key == "t":
            return self.__struct_config__.tag
        try:
            return getattr(self, key)
        except AttributeError:
            raise KeyError(key)
